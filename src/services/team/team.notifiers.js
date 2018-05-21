import fp from 'mostly-func';
import { helpers } from 'mostly-feathers-mongoose';

import { createTeamActivity, membersNotifications } from '../../helpers';

// create team activity
const createTeam = (context) => {
  const group = helpers.getHookData(context);
  const actor = context.params.user.id;
  const notifications = membersNotifications(group.users);
  const custom = {
    actor: `user:${actor}`,
    verb: 'group.create',
    message: 'Create a team',
  };
  return [
    createTeamActivity(context, group, custom),
    `user:${actor}`,                 // add to actor's activity log
    notifications                    // add to members' notification stream
  ];
};

// delete team activity
const deleteTeam = (context) => {
  const group = helpers.getHookData(context);
  const actor = context.params.user.id;
  const notifications = membersNotifications(group.users);
  const custom = {
    actor: `user:${actor}`,
    verb: 'group.delete',
    message: 'Delete a team',
  };
  return [
    createTeamActivity(context, group, custom),
    `user:${actor}`,                 // add to actor's activity log
    notifications                    // add to members' notification stream
  ];
};

export default {
  'group.create': createTeam,
  'group.delete': deleteTeam
};
