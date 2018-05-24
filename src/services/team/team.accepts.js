import fp from 'mostly-func';
import { helpers } from 'mostly-feathers-validate';

export default function accepts (context) {
  const svcTeamDesigns = context.app.service('team-designs');
  const svcTeams = context.app.service('teams');
  const svcUsers = context.app.service('users');

  // validation rules
  const definition = { arg: 'definition', type: 'string',
    validates: { exists: helpers.idExists(svcTeamDesigns, 'definition', 'Team definition is not exists') },
    required: true, description: 'Team definition' };

  const access = { arg: 'access', type: 'string',
    validates: { isIn: helpers.isIn('access', ['PUBLIC', 'PROTECTED', 'PRIVATE']) },
    required: true, description: 'Access of the team' };

  return {
    create: [ definition, access ]
  };
}
