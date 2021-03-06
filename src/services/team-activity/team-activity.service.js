const assert = require('assert');
const makeDebug = require('debug');
const fp = require('mostly-func');

const defaultHooks = require('./team-activity.hooks');

const debug = makeDebug('playing:team-services:teams/activities');

const defaultOptions = {
  name: 'teams/activities'
};

class TeamActivityService {
  constructor (options) {
    this.options = fp.assignAll(defaultOptions, options);
    this.name = this.options.name;
  }

  setup (app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
  }

  /**
   * Get a team's activity feed
   */
  async find (params) {
    const team = params.primary;
    assert(team, 'Team is not exists');

    const groups = fp.map(fp.prop('id'), params.user.groups);
    const exists = fp.find(fp.idEquals(team.id), groups || []);
    if (!exists) {
      throw new Error('Only members of the team can get the activity feed.');
    }

    const svcFeedsActivities = this.app.service('feeds/activities');
    return svcFeedsActivities.find({
      ...params,
      primary: `team:${team.id}`
    });
  }
}

module.exports = function init (app, options, hooks) {
  return new TeamActivityService(options);
};
module.exports.Service = TeamActivityService;
