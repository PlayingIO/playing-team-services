import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';

import defaultHooks from './team-role.hooks';

const debug = makeDebug('playing:team-services:teams/roles');

const defaultOptions = {
  name: 'teams/roles'
};

export class TeamRoleService {
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
  return new TeamRoleService(options);
}

init.Service = TeamRoleService;
