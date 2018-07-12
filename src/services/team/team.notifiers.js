const fp = require('mostly-func');
const { helpers } = require('mostly-feathers-mongoose');

const { createTeamActivity, membersNotifications } = require('../../helpers');

// create team activity
const createTeam = (context) => {
  const team = helpers.getHookData(context);
  const actor = helpers.getCurrentUser(context);
  if (!team || !actor) return;

  const notifications = membersNotifications(team.members);
  const custom = {
    actor: `user:${actor}`,
    verb: 'group.create',
    message: 'Team was created by ${actor}',
  };
  return [
    createTeamActivity(context, team, custom),
    `user:${actor}`,                 // add to actor's activity log
    notifications                    // add to members' notification stream
  ];
};

// delete team activity
const deleteTeam = (context) => {
  const team = helpers.getHookData(context);
  const actor = helpers.getCurrentUser(context);
  if (!team || !actor) return;

  const notifications = membersNotifications(team.members);
  const custom = {
    actor: `user:${actor}`,
    verb: 'group.delete',
    message: 'Team was disbanded by ${actor}',
  };
  return [
    createTeamActivity(context, team, custom),
    `user:${actor}`,                 // add to actor's activity log
    notifications                    // add to members' notification stream
  ];
};

// transfer ownership of mission activity
const transferTeam = (context) => {
  const team = helpers.getHookData(context);
  const actor = helpers.getCurrentUser(context);
  if (!team || !actor) return;

  const newOwner = context.data.player;
  const notifications = membersNotifications(team.members);
  const custom = {
    actor: `user:${actor}`,
    verb: 'group.transfer',
    message: 'Ownership of the team is transfered to ${newOnwer}',
    roles: context.data.roles,
    newOwner: `user:${newOwner}`
  };
  return [
    createTeamActivity(context, team, custom),
    `user:${actor}`,               // add to old owner's activity log
    `user:${newOwner}`,            // add to new owner's activity log
    `team:${team.id}`,             // add to mission's activity log
    notifications                  // add to all members' notification stream
  ];
};

module.exports = {
  'group.create': createTeam,
  'group.delete': deleteTeam,
  'group.transfer': transferTeam
};
