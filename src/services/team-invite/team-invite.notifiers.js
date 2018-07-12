const fp = require('mostly-func');
const { helpers } = require('mostly-feathers-mongoose');

const { createTeamActivity, membersNotifications } = require('../../helpers');

// invite accept activity
const acceptInvite = (context) => {
  const { team, activity } = context.params.locals;
  const actor = helpers.getCurrentUser(context);
  if (!activity || activity.state !== 'ACCEPTED' || !actor) return;

  const inviter = helpers.getId(activity.actor);
  const notifications = membersNotifications(team.members);
  let custom = {
    actor: `user:${actor}`,
    inviter: `user:${inviter}`,
    verb: 'team.invite.accept',
    message: '${inviter} has accepted the invite request',
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
  const actor = helpers.getCurrentUser(context);
  if (!activity || activity.state !== 'REJECTED' || !actor) return;

  const inviter = helpers.getId(activity.actor);
  let custom = {
    actor: `user:${actor}`,
    inviter: `user:${inviter}`,
    verb: 'team.invite.reject',
    message: '${inviter} has rejected the invite request',
    roles: activity.roles
  };
  return [
    createTeamActivity(context, team, custom),
    `notification:${actor}`,       // add to player's
    `user:${inviter}`              // add to inviter's notification stream
  ];
};

module.exports = {
  'team.invite.accept': acceptInvite,
  'team.invite.reject': rejectInvite
};
