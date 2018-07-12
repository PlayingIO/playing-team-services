const fp = require('mostly-func');
const { rolesExists } = require('../../helpers');

module.exports = function accepts (context) {
  const svcTeams = context.app.service('teams');
  const svcUsers = context.app.service('users');

  // validation rules
  const roles = { arg: 'roles', type: 'object',
    validates: { exists: rolesExists(svcTeams, 'primary', 'Roles is invalid') },
    required: true, description: 'Roles ' };

  const member = { arg: 'id', type: 'string', required: true, description: 'Member id' };

  return {
    create: [ roles ],
    remove: [ member ],
    kick: [ member ]
  };
};
