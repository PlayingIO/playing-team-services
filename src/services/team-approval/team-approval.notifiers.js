const fp = require('mostly-func');
const { helpers } = require('mostly-feathers-mongoose');

const { createTeamActivity, membersNotifications } = require('../../helpers');

// request accept activity
const acceptTeam = (context) => {
  const { team, activity } = context.params.locals;
  const actor = helpers.getCurrentUser(context);
  if (!activity || activity.state !== 'ACCEPTED' || !actor) return;

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
      message: 'Roles change request of ${player} was accepted',
      ...custom
    };
  }
  if (activity.verb === 'team.join.request') {
    custom = {
      verb: 'team.join.accept',
      message: 'Join request of ${player} was accepted',
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
  const actor = helpers.getCurrentUser(context);
  if (!activity || activity.state !== 'REJECTED' || !actor) return;

  const player = helpers.getId(activity.actor);
  let custom = {
    actor: `user:${actor}`,
    player: `user:${player}`,
    roles: activity.roles
  };
  if (activity.verb === 'team.roles.request') {
    custom = {
      verb: 'team.roles.reject',
      message: 'Roles change request of ${player} was rejected',
      ...custom
    };
  }
  if (activity.verb === 'team.join.request') {
    custom = {
      verb: 'team.join.reject',
      message: 'Join request of ${player} was rejected',
      ...custom
    };
  }
  return [
    createTeamActivity(context, team, custom),
    `notification:${player}`,      // add to player's notification stream
    `user:${team.owner}`,          // add to rejector's activity log
  ];
};

module.exports = {
  'team.accept': acceptTeam,
  'team.reject': rejectTeam
};
