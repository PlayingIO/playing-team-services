import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';
import { helpers } from 'mostly-feathers-mongoose';
import { helpers as feeds } from 'playing-feed-services';

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
    assert(team && team.id, 'Team is not exists.');

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

  /**
   * Cancel a pending request sent out by the current user
   */
  async remove (id, params) {
    // reject intead cancel
    if (params.action === 'reject') {
      return this.reject(id, params);
    }
    // check for pending request sent by current user
    const feed = `user:${params.user.id}`;
    const activity = await feeds.getPendingActivity(this.app, feed, id);
    if (!activity) {
      throw new Error('No pending request is found for this request id.');
    }
    // cancel from requester's feed
    activity.state = 'CANCELED';
    await feeds.updateActivityState(this.app, activity);
    return activity;
  }

  /**
   * Reject a pending request
   */
  async reject (id, params) {
    let team = params.primary;
    assert(team && team.id, 'Team is not exists.');

    // must be owner of the team
    if (!fp.idEquals(team.owner, params.user.id)) {
      throw new Error('Only owner of the team can reject the request.');
    }

    // check for pending request in notification of current user
    const notification = `notification:${params.user.id}`;
    const activity = await feeds.getPendingActivity(this.app, notification, id);
    if (!activity) {
      throw new Error('No pending request is found for this request id.');
    }
    // reject from requester's feed
    activity.state = 'REJECTED';
    await feeds.updateActivityState(this.app, activity);

    params.locals = { team, activity }; // for notifier

    return activity;
  }

}

export default function init (app, options, hooks) {
  return new TeamApprovalService(options);
}

init.Service = TeamApprovalService;
