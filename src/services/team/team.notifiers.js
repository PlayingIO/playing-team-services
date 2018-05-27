import fp from 'mostly-func';
import { helpers } from 'mostly-feathers-mongoose';

import { createTeamActivity, membersNotifications } from '../../helpers';

// create team activity
const createTeam = (context) => {
  const team = helpers.getHookData(context);
  if (!team) return;
  const actor = context.params.user.id;
  const notifications = membersNotifications(team.members);
  const custom = {
    actor: `user:${actor}`,
    verb: 'group.create',
    message: 'Create a team',
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
  if (!team) return;
  const actor = context.params.user.id;
  const notifications = membersNotifications(team.members);
  const custom = {
    actor: `user:${actor}`,
    verb: 'group.delete',
    message: 'Delete a team',
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
  if (!team) return;
  const actor = context.params.user.id;
  const newOwner = context.data.player;
  const notifications = membersNotifications(team.members);
  const custom = {
    actor: `user:${actor}`,
    verb: 'group.transfer',
    message: 'Transfer the ownership of the team',
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

export default {
  'group.create': createTeam,
  'group.delete': deleteTeam,
  'group.transfer': transferTeam
};
