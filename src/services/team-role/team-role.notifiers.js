import fp from 'mostly-func';
import { helpers } from 'mostly-feathers-mongoose';

import { createTeamActivity, membersNotifications } from '../../helpers';

// change roles team activity
const rolesTeam = (context) => {
  const { team } = context.params.locals;
  const actor = helpers.getCurrentUser(context);
  if (!team || !actor) return;

  const player = context.id;
  if (team.access === 'PUBLIC') {
    const notifications = membersNotifications(team.members);
    const custom = {
      actor: `user:${actor}`,
      verb: 'team.roles',
      message: '${actor} has changed roles of the team',
      roles: context.data.roles,
      player: `user:${player}`
    };
    return [
      createTeamActivity(context, team, custom),
      `user:${player}`,              // add to player's activity log
      `user:${team.owner}`,          // add to owner's activity log
      `team:${team.id}`,             // add to team's activity log
      notifications                  // add to all members' notification stream
    ];
  } else {
    const custom = {
      actor: `user:${actor}`,
      verb: 'team.roles.request',
      message: '${actor} requests to change roles of the team',
      roles: context.data.roles,
      state: 'PENDING',
      player: `user:${player}`
    };
    return [
      createTeamActivity(context, team, custom),
      `user:${actor}`,               // add to player's activity log
      `notification:${team.owner}`   // notify owner of the team to approve requests
    ];
  }
};

export default {
  'team.roles': rolesTeam
};
