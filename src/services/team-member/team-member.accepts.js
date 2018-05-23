import fp from 'mostly-func';
import { helpers } from 'mostly-feathers-validate';
import { rolesExists } from '../../helpers';

export default function accepts (context) {
  const svcTeams = context.app.service('teams');
  const svcUsers = context.app.service('users');

  // validation rules
  const roles = { arg: 'roles', type: 'object',
    validates: { exists: rolesExists(svcTeams, 'primary', 'Roles is invalid') },
    required: true, description: 'Roles ' };

  const member = { arg: 'id', type: 'string',
    validates: { exists: helpers.idExists(svcUsers, 'id', 'Member is not exists') },
    required: true, description: 'Member Id' };

  return {
    create: [ roles ],
    remove: [ member ],
    kick: [ member ]
  };
}
