import fp from 'mostly-func';
import { helpers } from 'mostly-feathers-mongoose';
import { helpers as rules } from 'playing-rule-services';

export const fulfillTeamRequires = (team, user) => {
  return rules.fulfillRequires(user, [], team.settings.requires);
};

// create a group activity
export const createTeamActivity = (context, team, custom) => {
  const actor = helpers.getId(team.owner);
  return {
    actor: `user:${actor}`,
    object: `${team.type}:${team.id}`,
    foreignId: `${team.type}:${team.id}`,
    time: new Date().toISOString(),
    definition: team.definition,
    ...custom
  };
};

// notification feeds of all team members
export const membersNotifications = function (members, excepts = []) {
  const users = fp.without(excepts, fp.map(fp.prop('user'), members || []));
  return fp.map(fp.concat('notification:'), users);
};