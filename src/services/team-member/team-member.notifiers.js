import fp from 'mostly-func';
import { helpers } from 'mostly-feathers-mongoose';

import { createTeamActivity, membersNotifications } from '../../helpers';

// join team activity
const joinTeam = (context) => {
  const { team } = context.params.locals;
  const actor = helpers.getCurrentUser(context);
  if (!team || !actor) return;

  if (team.access === 'PUBLIC') {
    const notifications = membersNotifications(team.members);
    const custom = {
      actor: `user:${actor}`,
      verb: 'team.join',
      message: '${actor} has joined the team',
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
      message: '${actor} requests to join the team',
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
  const actor = helpers.getCurrentUser(context);
  if (!team || !actor) return;

  const notifications = membersNotifications(team.members);
  const custom = {
    actor: `user:${actor}`,
    verb: 'team.leave',
    message: 'has left the team'
  };
  return [
    createTeamActivity(context, team, custom),
    `user:${actor}`,                 // add to player's activity log
    `team:${team.id}`,               // add to team's activity log
    notifications                    // add to all members' notification stream
  ];
};

// kick from team activity
const kickTeam = (context) => {
  const { team } = context.params.locals;
  const actor = helpers.getCurrentUser(context);
  if (!team || !actor) return;

  const player = context.id;
  const notifications = membersNotifications(team.members);
  const custom = {
    actor: `user:${actor}`,
    verb: 'team.kick',
    message: '${player} was kicked out of the team',
    roles: context.data.roles
  };
  return [
    createTeamActivity(context, team, custom),
    `user:${player}`,              // add to kicked player's activity log
    `notification:${player}`,      // add to kicked player's notification stream
    `team:${team.id}`,             // add to team's activity log
    notifications                  // add to all members' notification stream
  ];
};

export default {
  'team.join': joinTeam,
  'team.leave': leaveTeam,
  'team.kick': kickTeam
};
