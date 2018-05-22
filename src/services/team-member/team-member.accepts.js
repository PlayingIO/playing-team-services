import fp from 'mostly-func';
import { helpers } from 'mostly-feathers-validate';

export default function accepts (context) {
  const svcUsers = context.app.service('users');

  // validation rules
  const roles = { arg: 'roles', type: 'object',
    validates: { exists: helpers.isInParams('team.roles', 'Roles is invalid') },
    required: true, description: 'Roles ' };

  return {
    create: [ roles ]
  };
}
