import assert from 'assert';
import mongoose from 'mongoose';
import { createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';
import { group } from 'playing-user-services';

import TeamModel from '../../models/team.model';
import defaultHooks from './team.hooks';
import { fulfillTeamRequires } from '../../helpers';

class TeamService extends group.Service {

  constructor (options) {
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
    assert(data.groupname, 'data.groupname not provided');
    assert(data.label, 'data.label not provided');
    data.access = data.access || (data.isPublic? 'PUBLIC' : 'PROTECTED');
    delete data.isPublic;

    const svcTeamDesigns = this.app.service('team-designs');
    const svcPermissions = this.app.service('user-permissions');

    const getTeamDefinition = (id) => id? svcTeamDesigns.get(id) : Promise.resolve(null);

    const teamDef = await getTeamDefinition(data.definition);
    if (data.definition) assert(teamDef, 'data.definition not exists');
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
    const group = await super.create(data, params);
    if (teamDef && teamDef.permissions) {
      const createPermissions = fp.flatMap(permission => {
        return fp.map(([action, permit]) => {
          return svcPermissions.create({
            actions: [action],
            subject: 'group:' + group.id,
            role: permission.role,
            inverted: !permit,
            creator: data.owner,
            user: group.id
          });
        }, fp.toPairs(permission.permits || {}));
      }, teamDef.permissions);
      const permissions = await Promise.all(createPermissions);
      group.permissions = fp.flatten(permissions);
    }
    
    return group;
  }
}

export default function init (app, options, hooks) {
  options = { ModelName: 'team', ...options };
  return createService(app, TeamService, TeamModel, options);
}

init.Service = TeamService;
