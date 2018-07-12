const assert = require('assert');
const mongoose = require('mongoose');
const { createService } = require('mostly-feathers-mongoose');
const fp = require('mostly-func');
const { group } = require('playing-user-services');

const TeamModel = require('../../models/team.model');
const defaultHooks = require('./team.hooks');
const { fulfillTeamRequires } = require('../../helpers');

const defaultOptions = {
  name: 'teams'
};

class TeamService extends group.Service {

  constructor (options) {
    options = fp.assignAll(defaultOptions, options);
    super(options);
  }

  setup (app) {
    this.hooks(defaultHooks(this.options)); // run local hooks first
    super.setup(app);
  }

  /**
   * create a group by team definition
   */
  async create (data, params) {
    assert(data.groupname, 'groupname not provided');
    assert(data.label, 'label not provided');
    data.access = data.access || (data.isPublic? 'PUBLIC' : 'PROTECTED');
    delete data.isPublic;

    const svcTeamDesigns = this.app.service('team-designs');
    const svcUsersGroups = this.app.service('users/groups');
    const svcUserPermissions = this.app.service('user-permissions');

    const getTeamDefinition = (id) => id? svcTeamDesigns.get(id) : Promise.resolve(null);

    const teamDef = await getTeamDefinition(data.definition);
    if (data.definition) assert(teamDef, 'definition not exists');
    if (teamDef) {
      // creation requirements
      if (teamDef.settings && teamDef.settings.requires) {
        if (!fulfillTeamRequires(teamDef, params.user)) {
          throw new Error('Conditions for create this type of team is not satisfied.');
        }
      }
      if (!fp.contains(data.access, teamDef.access || [])) {
        throw new Error('Cannot create a ' + data.access + ' group of this type of team');
      }
      data.definition = teamDef.id;
      data.roles = fp.map(fp.prop('role'), teamDef.permissions || []);
    }

    // create team group
    const group = await super.create(data, params);
    // create permissions for the group
    if (teamDef && teamDef.permissions) {
      const createPermissions = fp.flatMap(permission => {
        return fp.map(([action, permit]) => {
          const rule = {
            subject: `team:${group.id}`,
            role: permission.role,
            inverted: !permission.permits[action],
            creator: data.owner,
            user: group.id
          };
          switch (action) {
            case 'lock':
              rule.actions = ['locks/create', 'locks/remove'];
              break;
            case 'peer':
              rule.actions = ['invites/create', 'invites/remove'];
              rule.conditions = { peer: true };
              break;
            case 'assign':
              rule.actions = ['invites/create', 'invites/remove'];
              rule.conditions = { assign: true };
              break;
            case 'leave':
              rule.actions = ['members/remove'];
              break;
            default:
              throw new Error(`Unkown permission action ${permit} for team creating`);
          }
          return svcUserPermissions.create(rule);
        }, fp.toPairs(permission.permits || {}));
      }, teamDef.permissions);
      const permissions = await Promise.all(createPermissions);
      group.permissions = fp.flatten(permissions);
    }
    // add creator roles
    if (teamDef.creatorRoles) {
      await svcUsersGroups.create({
        group: group.id,
        role: teamDef.creatorRoles
      }, {
        primary: params.user,
        user: params.user
      });
    }
    
    return group;
  }

  /**
   * Transfer team ownership to another player
   */
  async transfer (id, data, params) {
    let team = params.primary;
    assert(team && team.id, 'Team is not exists.');

    const svcUsers = this.app.service('users');
    const svcUsersGroups = this.app.service('users/groups');
    
    // must be owner of the team
    if (!fp.idEquals(team.owner, params.user.id)) {
      throw new Error('Only owner of the team can transfer ownership.');
    }
    if (fp.idEquals(team.owner, data.player)) {
      throw new Error('Already owner of the team.');
    }
    // get another player
    const player = await svcUsers.get(data.player);
    if (!player) {
      throw new Error('Another player is not exists');
    }
    const groups = fp.map(fp.prop('id'), player.groups);
    const member = fp.find(fp.idEquals(team.id), groups || []);

    if (!member) {
      await svcUsersGroups.create({
        group: team.id,
        role: data.roles
      }, {
        primary: player,
        user: params.user
      });
    } else {
      await svcUsersGroups.patch(team.id, {
        group: team.id,
        roles: data.roles
      }, {
        primary: player,
        user: params.user
      });
    }
    return super.patch(team.id, {
      owner: player.id
    });
  }

  /**
   * Disband a team
   */
  async remove (id, params) {
    let team = params.primary;
    assert(team && team.id, 'Team is not exists.');

    const svcUsers = this.app.service('users');
    const svcUsersGroups = this.app.service('users/groups');
    
    // must be owner of the team
    if (!fp.idEquals(team.owner, params.user.id)) {
      throw new Error('Only owner can disband the team.');
    }
 
    const removeMembers = fp.map(player => {
      return svcUsersGroups.remove(team.id, {
        primary: player,
        user: params.user,
        query: { group: team.id }
      });
    });
    await Promise.all(removeMembers(team.members || []));
    return super.remove(team.id, { $soft: true });
  }
}

module.exports = function init (app, options, hooks) {
  options = { ModelName: 'team', ...options };
  return createService(app, TeamService, TeamModel, options);
};
module.exports.Service = TeamService;
