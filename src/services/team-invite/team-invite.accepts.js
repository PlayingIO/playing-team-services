const fp = require('mostly-func');
const { helpers } = require('mostly-feathers-validate');
const { rolesExists } = require('../../helpers');

module.exports = function accepts (context) {
  const svcTeams = context.app.service('teams');
  const svcUsers = context.app.service('users');

  // validation rules
  const roles = { arg: 'roles', type: 'object',
    validates: { exists: rolesExists(svcTeams, 'primary', 'Roles is invalid') },
    required: true, description: 'Roles ' };

  const player = { arg: 'player', type: 'string', required: true, description: 'Player id' };

  const invite = { arg: 'id', type: 'string', required: true, description: 'Invite id' };

  return {
    create: [ player, roles ],
    remove: [ invite ],
    reject: [ invite ]
  };
};
