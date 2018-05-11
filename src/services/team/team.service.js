import assert from 'assert';
import makeDebug from 'debug';
import { Service, createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';
import TeamModel from '../../models/team.model';
import defaultHooks from './team.hooks';

const debug = makeDebug('playing:teams-services:teams');

const defaultOptions = {
  name: 'teams'
};

export class TeamService extends Service {
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
  options = { ModelName: 'team', ...options };
  return createService(app, TeamService, TeamModel, options);
}

init.Service = TeamService;
