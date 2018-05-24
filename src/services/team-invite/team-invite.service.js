import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';
import { helpers } from 'mostly-feathers-mongoose';
import { helpers as feeds } from 'playing-feed-services';

import defaultHooks from './team-invite.hooks';

const debug = makeDebug('playing:team-services:teams/invites');

const defaultOptions = {
  name: 'teams/invites'
};

export class TeamInviteService {
  constructor (options) {
    this.options = fp.assignAll(defaultOptions, options);
    this.name = this.options.name;
  }

  setup (app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
  }

  /**
   * List invitations sent out for a team
   */
  async find (params) {
    const team = params.primary;
    assert(team && team.id, 'Team is not exists.');

    // Only invitations sent out by current user will be listed.
    const svcFeedsActivities = this.app.service('feeds/activities');
    return svcFeedsActivities.find({
      primary: `user:${params.user.id}`,
      query: {
        verb: 'team.invite',
        actor: `user:${params.user.id}`,
        object: `team:${team.id}`,
        state: 'PENDING',
        ...params.query
      }
    });
  }

  /**
   * Invite a player to join a team
   */
  async create (data, params) {
    const team = params.primary;
    assert(team && team.id, 'Team is not exists.');
    data.message = data.message || 'Invite you to join the team';

    const svcUsers = this.app.service('users');
    const svcFeedsActivities = this.app.service('feeds/activities');
    
    // must be owner of the team
    if (!fp.idEquals(team.owner, params.user.id)) {
      throw new Error('Only team owner can send invites.');
    }

    // whether target user is a member
    const user = await svcUsers.get(data.player);
    let groups = fp.map(fp.prop('id'), user.groups);
    const exists = fp.find(fp.idEquals(team.id), groups || []);
    if (!exists) {
      throw new Error('Requested player is already a part of the team.');
    }

    // check for pending invitation sent by current user
    const invitations = await svcFeedsActivities.find({
      primary: `user:${params.user.id}`,
      query: {
        verb: 'team.invite',
        object: `team:${team.id}`,
        invitee: `user:${data.player}`,
        state: 'PENDING'
      }
    });
    if (fp.isNotEmpty(invitations.data)) {
      throw new Error('An invitation is already pending for the requested player.');
    }

    // create team invite activity
    const activity = {
      actor: `user:${params.user.id}`,
      verb: 'team.invite',
      object: `team:${team.id}`,
      foreignId: `${team.type}:${team.id}`,
      time: new Date().toISOString(),
      definition: `team-design:${team.definition}`,
      message: data.message,
      invitee: `user:${data.player}`,
      roles: data.roles,
      state: 'PENDING'
    };
    return feeds.addActivity(this.app, activity,
      `user:${params.user.id}`,            // add to actor's activity log
      `notification:${data.player}`        // add to invited player's notification stream
    );
  }
}

export default function init (app, options, hooks) {
  return new TeamInviteService(options);
}

init.Service = TeamInviteService;
