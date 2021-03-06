const assert = require('assert');
const makeDebug = require('debug');
const fp = require('mostly-func');
const { helpers } = require('mostly-feathers-mongoose');
const feeds = require('playing-feed-common');

const defaultHooks = require('./team-approval.hooks');

const debug = makeDebug('playing:team-services:teams/approvals');

const defaultOptions = {
  name: 'teams/approvals'
};

class TeamApprovalService {
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
   * Approve team join or role change request
   */
  async patch (id, data, params) {
    let team = params.primary;
    assert(team && team.id, 'Team is not exists.');

    // must be owner of the team
    if (!fp.idEquals(team.owner, params.user.id)) {
      throw new Error('Only owner of the team can approval the request.');
    }

    const svcUsers = this.app.service('users');
    const svcUsersGroups = this.app.service('users/groups');
    const svcFeedsActivities = this.app.service('feeds/activities');

    // check for pending requests
    const notification = `notification:${params.user.id}`;
    const activity = await feeds.getPendingActivity(this.app, notification, id);
    if (!activity) {
      throw new Error(`No pending request is found: ${id}.`);
    }

    // get values from activity
    const actor = helpers.getId(activity.actor);
    const roles = activity.roles;
    assert(actor, 'actor not exists in request activity');
    assert(roles, 'roles not exists in request activity');

    // get request user
    const user = await svcUsers.get(actor);
    if (!user) {
      throw new Error('Request user is not exists');
    }

    params.locals = { team }; // for notifier

    switch (activity.verb) {
      case 'team.join.request': {
        const groups = fp.map(fp.prop('id'), user.groups);
        const member = fp.find(fp.idEquals(team.id), groups || []);
        if (!member) {
          // add user to team with roles
          await svcUsersGroups.create({
            group: team.id,
            roles: roles
          }, {
            primary: actor,
            user: params.user
          });
          activity.state = 'ACCEPTED';
          await feeds.updateActivityState(this.app, activity);
          params.locals.activity = activity;
        } else {
          activity.state = 'ALREADY';
          await feeds.updateActivityState(this.app, activity);
          params.locals.activity = activity;
        }
        break;
      }
      case 'team.roles.request': {
        // update user's roles in team
        await svcUsersGroups.patch(team.id, {
          group: team.id,
          roles: roles
        }, {
          primary: actor,
          user: params.user
        });
        activity.state = 'ACCEPTED';
        await feeds.updateActivityState(this.app, activity);
        params.locals.activity = activity;
        break;
      }
      default:
        throw new Error(`Unkown activity verb: ${activity.verb}`);
    }

    return activity;
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
    const team = params.primary;
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

module.exports = function init (app, options, hooks) {
  return new TeamApprovalService(options);
};
module.exports.Service = TeamApprovalService;
