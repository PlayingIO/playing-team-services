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
    const team = params.team;
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
    const team = params.team;
    assert(team, 'target team is not exists');
    params.query.groups = {
      $elemMatch: { group: team.id }
    };
    const svcUsers = this.app.service('users');
    return svcUsers.get(id, params);
  }

  /**
   * Join a team with specified the role
   */
  async create (data, params) {
    const team = params.team;
    assert(team, 'target team is not exists');
    assert(assert.access !== 'PRIVATE', 'The team is private and invite only.');

    let groups = params.user.groups;
    const exists = fp.find(fp.idPropEq('group', team.id), groups || []);
    if (exists) {
      throw new Error('You are already a member of the team.');
    }

    // process the join for public mission
    const svcUsersGroupsService = this.app.service('users/groups');
    if (team.access === 'PUBLIC') {
      groups = await svcUsersGroupsService.create({
        group: team.id,
        role: fp.keys(data.roles)
      }, {
        primary: params.user,
        user: params.user
      });
    } else {
      // check for pending join request sent by current user
      const svcFeedsActivities = this.app.service('feeds/activities');
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
}

export default function init (app, options, hooks) {
  return new TeamMemberService(options);
}

init.Service = TeamMemberService;
