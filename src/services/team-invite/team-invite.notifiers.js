import fp from 'mostly-func';
import { helpers } from 'mostly-feathers-mongoose';

import { createTeamActivity, membersNotifications } from '../../helpers';

// invite accept activity
const acceptInvite = (context) => {
  const { team, activity } = context.params.locals;
  if (!activity || activity.state !== 'ACCEPTED') return;

  const actor = context.params.user.id;
  const inviter = helpers.getId(activity.actor);
  const notifications = membersNotifications(team.members);
  let custom = {
    actor: `user:${actor}`,
    inviter: `user:${inviter}`,
    verb: 'team.invite.accept',
    message: 'Invite request accept',
    roles: activity.roles
  };
  return [
    createTeamActivity(context, team, custom),
    `user:${inviter}`,             // add to inviter's activity log
    `notification:${inviter}`,     // add to inviter's notification stream
    `team:${team.id}`,             // add to team's activity log
    notifications                  // add to all members' notification stream
  ];
};

// invite reject activity
const rejectInvite = (context) => {
  const { team, activity } = context.params.locals;
  if (!activity || activity.state !== 'REJECTED') return;

  const actor = context.params.user.id;
  const inviter = helpers.getId(activity.actor);
  let custom = {
    actor: `user:${actor}`,
    inviter: `user:${inviter}`,
    verb: 'team.invite.reject',
    message: 'Invite request reject',
    roles: activity.roles
  };
  return [
    createTeamActivity(context, team, custom),
    `notification:${actor}`,       // add to player's 
    `user:${inviter}`              // add to inviter's notification stream
  ];
};

export default {
  'team.invite.accept': acceptInvite,
  'team.invite.reject': rejectInvite
};
