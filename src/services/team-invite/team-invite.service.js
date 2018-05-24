import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';

import defaultHooks from './team-invite.hooks';

const debug = makeDebug('playing:team-services:teams/invites');

const defaultOptions = {
  name: 'teams/invites'
};

export class TeamInviteService {
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
  return new TeamInviteService(options);
}

init.Service = TeamInviteService;
