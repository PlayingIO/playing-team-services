import { iff } from 'feathers-hooks-common';
import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';
import { sanitize, validate } from 'mostly-feathers-validate';
import feeds from 'playing-feed-common';

import accepts from './team-member.accepts';
import notifiers from './team-member.notifiers';

export default function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        cache(options.cache)
      ],
      find: [
        hooks.addRouteObject('primary', { service: 'teams' })
      ],
      get: [
        hooks.addRouteObject('primary', { service: 'teams' })
      ],
      create: [
        hooks.addRouteObject('primary', { service: 'teams', select: 'members,*' }),
        sanitize(accepts),
        validate(accepts)
      ],
      remove: [
        hooks.addRouteObject('primary', { service: 'teams', select: 'members,*' }),
        sanitize(accepts),
        validate(accepts)
      ]
    },
    after: {
      all: [
        cache(options.cache),
        hooks.responder()
      ],
      create: [
        feeds.notify('team.join', notifiers)
      ],
      remove: [
        iff(hooks.isAction('kick'),
          feeds.notify('team.kick', notifiers))
        .else(
          feeds.notify('team.leave', notifiers)
        )
      ]
    }
  };
}