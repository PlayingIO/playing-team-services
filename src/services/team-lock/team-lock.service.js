const assert = require('assert');
const makeDebug = require('debug');
const fp = require('mostly-func');

const defaultHooks = require('./team-lock.hooks');

const debug = makeDebug('playing:team-services:teams/locks');

const defaultOptions = {
  name: 'teams/locks'
};

class TeamLockService {
  constructor (options) {
    this.options = fp.assignAll(defaultOptions, options);
    this.name = this.options.name;
  }

  setup (app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
  }


  /**
   * Lock the team, so no member can join or leave the team
   */
  async create (data, params) {
    let team = params.primary;
    assert(team && team.id, 'Team is not exists.');

    const svcTeams = this.app.service('teams');

    // must be owner of the team
    if (!fp.idEquals(team.owner, params.user.id)) {
      throw new Error('Only owner of the team can lock the team.');
    }

    if (team.lockedAt) {
      throw new Error('Team is already locked');
    }

    return svcTeams.patch(team.id, {
      lockedAt: new Date()
    });
  }

  /**
   * Unlock the team
   */
  async remove (id, params) {
    let team = params.primary;
    assert(team && team.id, 'Team is not exists.');

    const svcTeams = this.app.service('teams');

    // must be owner of the team
    if (!fp.idEquals(team.owner, params.user.id)) {
      throw new Error('Only owner of the team can lock the team.');
    }

    if (!team.lockedAt) {
      throw new Error('Team is not locked');
    }

    return svcTeams.patch(team.id, {
      lockedAt: null
    });
  }
}

module.exports = function init (app, options, hooks) {
  return new TeamLockService(options);
};
module.exports.Service = TeamLockService;
