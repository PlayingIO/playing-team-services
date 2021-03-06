const assert = require('assert');
const makeDebug = require('debug');
const fp = require('mostly-func');

const defaultHooks = require('./team-role.hooks');

const debug = makeDebug('playing:team-services:teams/roles');

const defaultOptions = {
  name: 'teams/roles'
};

class TeamRoleService {
  constructor (options) {
    this.options = fp.assignAll(defaultOptions, options);
    this.name = this.options.name;
  }

  setup (app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
  }

  /**
   * Change own roles in team.
   */
  async patch (id, data, params) {
    const team = params.primary;
    assert(team && team.id, 'Team not exists.');

    const svcUsers = this.app.service('users');
    const svcUsersGroups = this.app.service('users/groups');
    const svcFeedsActivities = this.app.service('feeds/activities');

    const isOwner = fp.idEquals(team.owner, params.user.id);
    if (!fp.idEquals(id, params.user.id)) { // change roles by owner
      if (!isOwner) {
        throw new Error('Only owner of the team can change roles of other member.');
      }
    }

    // whether target user is a member
    const user = await svcUsers.get(id);
    if (!user) {
      throw new Error('Target user is not exists');
    }
    const groups = fp.map(fp.prop('id'), user.groups);
    const exists = fp.find(fp.idEquals(team.id), groups || []);
    if (!exists) {
      throw new Error('Target user is not a member of this team.');
    }

    params.locals = { team }; // for noitifier

    // process the change if owner or it's a public team
    if (isOwner || team.access === 'PUBLIC') {
      // update members's roles
      return svcUsersGroups.patch(team.id, {
        group: team.id,
        roles: data.roles
      }, {
        primary: user,
        user: params.user
      });
    } else {
      // check for pending roles request sent by target user
      const invitations = await svcFeedsActivities.find({
        primary: `notification:${team.owner}`,
        query: {
          actor: `user:${user.id}`,
          verb: 'team.roles.request',
          object: `team:${team.id}`,
          state: 'PENDING'
        }
      });
      if (fp.isNotEmpty(invitations.data)) {
        throw new Error('An roles change request is already pending for the user.');
      }

      // send team.role in notifier
      return invitations;
    }
  }
}

module.exports = function init (app, options, hooks) {
  return new TeamRoleService(options);
};
module.exports.Service = TeamRoleService;
