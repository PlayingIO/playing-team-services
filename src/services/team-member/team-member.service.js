import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';

import defaultHooks from './team-member.hooks';

const debug = makeDebug('playing:team-services:teams/members');

const defaultOptions = {
  name: 'teams/members'
};

export class TeamMemberService {
  constructor (options) {
    this.options = fp.assignAll(defaultOptions, options);
    this.name = this.options.name;
  }

  setup (app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
  }

  /**
   * List all members of the target team
   */
  async find (params) {
    params = { query: {}, ...params };
    const team = params.primary;
    assert(team, 'target team is not exists');
    params.query.groups = {
      $elemMatch: { group: team.id }
    };
    const svcUsers = this.app.service('users');
    return svcUsers.find(params);
  }

  /**
   * Get the profile of a team member
   */
  async get (id, params) {
    const team = params.primary;
    assert(team, 'target team is not exists');
    params.query.groups = {
      $elemMatch: { group: team.id }
    };
    const svcUsers = this.app.service('users');
    return svcUsers.get(id, params);
  }

  /**
   * Join a team with specified the role.
   */
  async create (data, params) {
    const team = params.primary;
    assert(team, 'target team is not exists');
    assert(assert.access !== 'PRIVATE', 'The team is private and invite only.');

    const svcUsersGroups = this.app.service('users/groups');
    const svcFeedsActivities = this.app.service('feeds/activities');

    // whether current user is a member
    let groups = fp.map(fp.prop('id'), params.user.groups);
    const exists = fp.find(fp.idEquals(team.id), groups || []);
    if (exists) {
      throw new Error('You are already a member of the team.');
    }

    // process the join for public team
    if (team.access === 'PUBLIC') {
      groups = await svcUsersGroups.create({
        group: team.id,
        role: data.roles
      }, {
        primary: params.user,
        user: params.user
      });
    } else {
      // check for pending join request sent by current user
      const invitations = await svcFeedsActivities.find({
        primary: `notification:${team.owner}`,
        query: {
          actor: `user:${params.user.id}`,
          verb: 'team.join.request',
          object: `team:${team.id}`,
          state: 'PENDING'
        }
      });
      if (fp.isNotEmpty(invitations.data)) {
        throw new Error('An join request is already pending for the current user.');
      }
      // send team.join.request in notifier
    }

    params.locals = { team }; // for notifier

    return groups;
  }

  /**
   * Leave a team.
   */
  async remove (id, params) {
    const team = params.primary;
    assert(team, 'target team is not exists');

    // kick intead leave
    if (params.action === 'kick') {
      return this.kick(id, params);
    }

    const svcUsersGroups = this.app.service('users/groups');

    // the owner himself cannot leave
    if (fp.idEquals(team.owner, params.user.id)) {
      throw new Error('Owner of the team cannot leave yourself.');
    }

    // whether current user is a member
    let groups = fp.map(fp.prop('id'), params.user.groups);
    const exists = fp.find(fp.idEquals(team.id), groups || []);
    if (!exists) {
      throw new Error('You are not a member of this team.');
    }

    groups = await svcUsersGroups.remove(null, {
      primary: params.user,
      user: params.user,
      query: { group: team.id }
    });

    params.locals = { team }; // for notifier

    return groups;
  }

  /**
   * Kick out a member from the team.
   */
  async kick (id, params) {
    const team = params.primary;
    assert(team, 'target team is not exists');

    const svcUsers = this.app.service('users');
    const svcUsersGroups = this.app.service('users/groups');

    // must be owner of the team
    if (!fp.idEquals(team.owner, params.user.id)) {
      throw new Error('Only owner of the team can kick a player.');
    }
    // the owner cannot kicked out himself
    if (fp.idEquals(team.owner, id)) {
      throw new Error('Owner of the team cannot kick yourself.');
    }

    // whether target user is a member
    const user = await svcUsers.get(id);
    let groups = fp.map(fp.prop('id'), user.groups);
    const exists = fp.find(fp.idEquals(team.id), groups || []);
    if (!exists) {
      throw new Error('Target user is not a member of this team.');
    }

    groups = await svcUsersGroups.remove(null, {
      primary: id,
      user: params.user,
      query: { group: team.id }
    });

    params.locals = { team }; // for notifier

    return groups;
  }
}

export default function init (app, options, hooks) {
  return new TeamMemberService(options);
}

init.Service = TeamMemberService;
