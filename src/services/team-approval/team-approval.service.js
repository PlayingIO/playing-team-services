import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';

import defaultHooks from './team-approval.hooks';

const debug = makeDebug('playing:team-services:teams/approvals');

const defaultOptions = {
  name: 'teams/approvals'
};

export class TeamApprovalService {
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
  return new TeamApprovalService(options);
}

init.Service = TeamApprovalService;
