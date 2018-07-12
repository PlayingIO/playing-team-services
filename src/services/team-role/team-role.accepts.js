const { rolesExists } = require('../../helpers');

module.exports = function accepts (context) {
  const svcTeams = context.app.service('teams');

  // validation rules
  const roles = { arg: 'roles', type: 'object',
    validates: { exists: rolesExists(svcTeams, 'primary', 'Roles is invalid') },
    required: true, description: 'Roles ' };

  const member = { arg: 'id', type: 'string', required: true, description: 'Member id' };

  return {
    patch: [ member, roles ]
  };
};