import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';

import defaultHooks from './team-lock.hooks';

const debug = makeDebug('playing:team-services:teams/locks');

const defaultOptions = {
  name: 'teams/locks'
};

export class TeamLockService {
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
  return new TeamLockService(options);
}

init.Service = TeamLockService;
