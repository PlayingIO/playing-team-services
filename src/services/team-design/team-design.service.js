import assert from 'assert';
import makeDebug from 'debug';
import { Service, createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';
import TeamDesignModel from '../../models/team-design.model';
import defaultHooks from './team-design.hooks';

const debug = makeDebug('playing:teams-services:team-designs');

const defaultOptions = {
  name: 'team-designs'
};

export class TeamDesignService extends Service {
  constructor (options) {
    options = fp.assignAll(defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }
}

export default function init (app, options, hooks) {
  options = { ModelName: 'team-design', ...options };
  return createService(app, TeamDesignService, TeamDesignModel, options);
}

init.Service = TeamDesignService;
