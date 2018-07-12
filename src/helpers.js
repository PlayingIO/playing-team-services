const assert = require('assert');
const fp = require('mostly-func');
const { helpers } = require('mostly-feathers-mongoose');
const rules = require('playing-rule-common');

const fulfillTeamRequires = (team, user) => {
  return rules.fulfillRequires(user, [], team.settings.requires);
};

// validator for roles
const rolesExists = (service, id, message) => async (val, params) => {
  assert(params[id], `rolesExists '${id}' is not exists in validation params`);
  const team = fp.isIdLike(params[id])? await service.get(params[id]) : params[id];
  const roles = fp.keys(val);
  if (team && team.roles) {
    if (fp.includesAll(roles, team.roles)) return;
  } else {
    message = 'Team roles is not exists';
  }
  return message;
};

// create a group activity
const createTeamActivity = (context, team, custom) => {
  const actor = helpers.getId(team.owner);
  return {
    actor: `user:${actor}`,
    object: `team:${team.id}`,
    foreignId: `${team.type}:${team.id}`,
    time: new Date().toISOString(),
    definition: team.definition,
    ...custom
  };
};

// notification feeds of all team members
const membersNotifications = function (members, excepts = []) {
  const users = fp.without(excepts, fp.map(fp.prop('id'), members || []));
  return fp.map(fp.concat('notification:'), users);
};

module.exports = {
  createTeamActivity,
  fulfillTeamRequires,
  membersNotifications,
  rolesExists
};