import fp from 'mostly-func';
import { helpers } from 'mostly-feathers-mongoose';

import { createTeamActivity, membersNotifications } from '../../helpers';

// lock team activity
const lockTeam = (context) => {
  const team = helpers.getHookData(context);
  if (!team) return;
  const actor = helpers.getCurrentUser(context);
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
  if (!team) return;
  const actor = helpers.getCurrentUser(context);
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

export default {
  'group.lock': lockTeam,
  'group.unlock': unlockTeam
};
