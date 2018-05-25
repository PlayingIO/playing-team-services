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

  const player = { arg: 'player', type: 'string',
    validates: { exists: helpers.idExists(svcUsers, 'player', 'Player is not exists') },
    required: true, description: 'Player' };

  const invite = { arg: 'id', type: 'string', required: true, description: 'Invite id' };

  return {
    create: [ player, roles ],
    remove: [ invite ],
    reject: [ invite ]
  };
}
