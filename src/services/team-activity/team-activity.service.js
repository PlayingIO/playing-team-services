import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';

import defaultHooks from './team-activity.hooks';

const debug = makeDebug('playing:mission-services:teams/activities');

const defaultOptions = {
  name: 'teams/activities'
};

export class TeamActivityService {
  constructor (options) {
    this.options = fp.assignAll(defaultOptions, options);
    this.name = this.options.name;
  }

  setup (app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
  }
}

export default function init (app, options, hooks) {
  return new TeamActivityService(options);
}

init.Service = TeamActivityService;
