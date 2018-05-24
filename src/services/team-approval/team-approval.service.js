import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';

import defaultHooks from './team-approval.hooks';

const debug = makeDebug('playing:team-services:teams/approvals');

const defaultOptions = {
  name: 'teams/approvals'
};

export class TeamApprovalService {
  constructor (options) {
    this.options = fp.assignAll(defaultOptions, options);
    this.name = this.options.name;
  }

  setup (app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
  }

  /**
   * List pending team join or role change requests
   */
  async find (params) {
    const team = params.primary;
    assert(team, 'Team is not exists.');

    // must be owner of the team
    if (!fp.idEquals(team.owner, params.user.id)) {
      throw new Error('Only team owner can list pending requests.');
    }

    // check for pending invitation
    const svcFeedsActivities = this.app.service('feeds/activities');
    return svcFeedsActivities.find({
      primary: `notification:${team.owner}`,
      query: {
        verb: { $in: ['team.join.request', 'team.roles.request'] },
        object: `team:${team.id}`,
        state: 'PENDING'
      }
    });
  }

}

export default function init (app, options, hooks) {
  return new TeamApprovalService(options);
}

init.Service = TeamApprovalService;
