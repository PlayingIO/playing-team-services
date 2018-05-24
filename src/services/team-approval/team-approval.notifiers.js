import fp from 'mostly-func';
import { helpers } from 'mostly-feathers-mongoose';

import { createTeamActivity, membersNotifications } from '../../helpers';

// request accept activity
const acceptTeam = (context) => {
  const { team, activity } = context.params.locals;
  if (!activity || activity.state !== 'ACCEPTED') return [];

  const actor = context.params.user.id;
  const player = helpers.getId(activity.actor);
  const notifications = membersNotifications(team.members);
  let custom = {
    actor: `user:${actor}`,
    player: `user:${player}`,
    roles: activity.roles
  };
  if (activity.verb === 'team.roles.request') {
    custom = {
      verb: 'team.roles.accept',
      message: 'Change roles request accept',
      ...custom
    };
  }
  if (activity.verb === 'team.join.request') {
    custom = {
      verb: 'team.join.accept',
      message: 'Join request accept',
      ...custom
    };
  }
  return [
    createTeamActivity(context, team, custom),
    `user:${player}`,              // add to player's activity log
    `notification:${player}`,      // add to player's notification stream
    `user:${team.owner}`,          // add to approver's activity log
    `team:${team.id}`,             // add to team's activity log
    notifications                  // add to all members' notification stream
  ];
};

// request reject activity
const rejectTeam = (context) => {
  const { team, activity } = context.params.locals;
  if (!activity || activity.state !== 'REJECTED') return [];

  const actor = context.params.user.id;
  const player = helpers.getId(activity.actor);
  let custom = {  
    actor: `user:${actor}`,
    player: `user:${player}`,
    roles: activity.roles
  };
  if (activity.verb === 'team.roles.request') {
    custom = {
      verb: 'team.roles.reject',
      message: 'Change roles request reject',
      ...custom
    };
  }
  if (activity.verb === 'team.join.request') {
    custom = {
      verb: 'team.join.reject',
      message: 'Join request reject',
      ...custom
    };
  }
  return [
    createTeamActivity(context, team, custom),
    `notification:${player}`,      // add to player's notification stream
    `user:${team.owner}`,          // add to rejector's activity log
  ];
};

export default {
  'team.accept': acceptTeam,
  'team.reject': rejectTeam
};
