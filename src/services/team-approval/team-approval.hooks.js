import { iff } from 'feathers-hooks-common';
import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';
import { hooks as feeds } from 'playing-feed-services';

import notifiers from './team-approval.notifiers';

export default function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        cache(options.cache)
      ],
      find: [
        hooks.addRouteObject('primary', { service: 'teams' }),
      ],
      patch: [
        hooks.addRouteObject('primary', { service: 'teams' }),
      ],
      remove: [
        hooks.addRouteObject('primary', { service: 'teams' }),
      ]
    },
    after: {
      all: [
        cache(options.cache),
        hooks.responder()
      ],
      patch: [
        feeds.notify('team.accept', notifiers)
      ]
    }
  };
}