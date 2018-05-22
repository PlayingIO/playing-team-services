import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';

import defaultHooks from './team-member.hooks';

const debug = makeDebug('playing:team-services:teams/members');

const defaultOptions = {
  name: 'teams/members'
};

export class TeamMemberService {
  constructor (options) {
    this.options = fp.assignAll(defaultOptions, options);
    this.name = this.options.name;
  }

  setup (app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
  }

  /**
   * find members of target team
   */
  async find (params) {
    params = { query: {}, ...params };
    const team = params.team;
    assert(team, 'target team is not exists');
    params.query.groups = {
      $elemMatch: { group: team.id }
    };
    const svcUsers = this.app.service('users');
    return svcUsers.find(params);
  }
}

export default function init (app, options, hooks) {
  return new TeamMemberService(options);
}

init.Service = TeamMemberService;
