import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';

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
   * List invitations sent out for a mission
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
}

export default function init (app, options, hooks) {
  return new TeamInviteService(options);
}

init.Service = TeamInviteService;
