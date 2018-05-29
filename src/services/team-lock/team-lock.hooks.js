import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';
import feeds from 'playing-feed-common';
import { authorize } from 'playing-permissions';

import notifiers from './team-lock.notifiers';

export default function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        authorize('teams'),
        cache(options.cache)
      ],
      create: [
        hooks.addRouteObject('primary', { service: 'teams', select: 'members,*' })
      ],
      remove: [
        hooks.addRouteObject('primary', { service: 'teams', select: 'members,*' })
      ]
    },
    after: {
      all: [
        cache(options.cache),
        hooks.responder()
      ],
      create: [
        feeds.notify('group.lock', notifiers)
      ],
      remove: [
        feeds.notify('group.unlock', notifiers)
      ]
    }
  };
}