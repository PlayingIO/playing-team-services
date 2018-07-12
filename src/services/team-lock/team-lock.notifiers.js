const fp = require('mostly-func');
const { helpers } = require('mostly-feathers-mongoose');

const { createTeamActivity, membersNotifications } = require('../../helpers');

// lock team activity
const lockTeam = (context) => {
  const team = helpers.getHookData(context);
  const actor = helpers.getCurrentUser(context);
  if (!team || !actor) return;

  const notifications = membersNotifications(team.members);
  const custom = {
    actor: `user:${actor}`,
    verb: 'group.lock',
    message: 'Team is locked',
  };
  return [
    createTeamActivity(context, team, custom),
    `user:${actor}`,                 // add to actor's activity log
    `team:${team.id}`,             // add to mission's activity log
    notifications                    // add to members' notification stream
  ];
};

// unlock team activity
const unlockTeam = (context) => {
  const team = helpers.getHookData(context);
  const actor = helpers.getCurrentUser(context);
  if (!team || !actor) return;

  const notifications = membersNotifications(team.members);
  const custom = {
    actor: `user:${actor}`,
    verb: 'group.unlock',
    message: 'Team is unlocked',
  };
  return [
    createTeamActivity(context, team, custom),
    `user:${actor}`,                 // add to actor's activity log
    `team:${team.id}`,             // add to mission's activity log
    notifications                    // add to members' notification stream
  ];
};

module.exports = {
  'group.lock': lockTeam,
  'group.unlock': unlockTeam
};
