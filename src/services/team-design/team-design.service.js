const assert = require('assert');
const makeDebug = require('debug');
const { Service, createService } = require('mostly-feathers-mongoose');
const fp = require('mostly-func');
const TeamDesignModel = require('../../models/team-design.model');
const defaultHooks = require('./team-design.hooks');

const debug = makeDebug('playing:teams-services:team-designs');

const defaultOptions = {
  name: 'team-designs'
};

class TeamDesignService extends Service {
  constructor (options) {
    options = fp.assignAll(defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }
}

module.exports = function init (app, options, hooks) {
  options = { ModelName: 'team-design', ...options };
  return createService(app, TeamDesignService, TeamDesignModel, options);
};
module.exports.Service = TeamDesignService;
