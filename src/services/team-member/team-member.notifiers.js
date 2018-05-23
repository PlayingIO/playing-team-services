import fp from 'mostly-func';
import { helpers } from 'mostly-feathers-mongoose';

import { createTeamActivity, membersNotifications } from '../../helpers';

// join team activity
const joinTeam = (context) => {
  const { team } = context.params.locals;
  const actor = context.params.user.id;
  if (team.access === 'PUBLIC') {
    const notifications = membersNotifications(team.members);
    const custom = {
      actor: `user:${actor}`,
      verb: 'team.join',
      message: 'Join the team',
      roles: context.data.roles
    };
    return [
      createTeamActivity(context, team, custom),
      `user:${actor}`,               // add to player's activity log
      `user:${team.owner}`,          // add to owner's activity log
      `team:${team.id}`,             // add to team's activity log
      notifications                  // add to all members' notification stream
    ];
  } else {
    const custom = {
      actor: `user:${actor}`,
      verb: 'team.join.request',
      message: 'Request join the team',
      roles: context.data.roles,
      state: 'PENDING'
    };
    return [
      createTeamActivity(context, team, custom),
      `user:${actor}`,               // add to player's activity log
      `notification:${team.owner}`   // notify owner of the team to approve requests
    ];
  }
};

// leave team activity
const leaveTeam = (context) => {
  const { team } = context.params.locals;
  const actor = context.params.user.id;
  const notifications = membersNotifications(team.members);
  const custom = {
    actor: `user:${actor}`,
    verb: 'team.leave',
    message: 'Leave the team'
  };
  return [
    createTeamActivity(context, team, custom),
    `user:${actor}`,                 // add to player's activity log
    `team:${team.id}`,               // add to team's activity log
    notifications                    // add to all members' notification stream
  ];
};

export default {
  'team.join': joinTeam,
  'team.leave': leaveTeam,
};
