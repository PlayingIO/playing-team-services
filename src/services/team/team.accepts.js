const fp = require('mostly-func');
const { helpers } = require('mostly-feathers-validate');
const { rolesExists } = require('../../helpers');

module.exports = function accepts (context) {
  const svcTeamDesigns = context.app.service('team-designs');
  const svcTeams = context.app.service('teams');

  // validation rules
  const definition = { arg: 'definition', type: 'string',
    validates: { exists: helpers.idExists(svcTeamDesigns, 'definition', 'Team definition is not exists') },
    required: true, description: 'Team definition' };

  const access = { arg: 'access', type: 'string',
    validates: { isIn: helpers.isIn('access', ['PUBLIC', 'PROTECTED', 'PRIVATE']) },
    required: true, description: 'Access of the team' };

  const roles = { arg: 'roles', type: 'object',
    validates: { exists: rolesExists(svcTeams, 'primary', 'Roles is invalid') },
    required: true, description: 'Roles ' };

  const player = { arg: 'player', type: 'string', required: true, description: 'Player id' };

  return {
    create: [ definition, access ],
    transfer: [ player, roles ]
  };
};
