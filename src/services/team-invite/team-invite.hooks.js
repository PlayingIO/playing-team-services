import { iff } from 'feathers-hooks-common';
import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';
import { sanitize, validate } from 'mostly-feathers-validate';
import { hooks as feeds } from 'playing-feed-services';

import accepts from './team-invite.accepts';
import notifiers from './team-invite.notifiers';

export default function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        cache(options.cache)
      ],
      find: [
        hooks.addRouteObject('primary', { service: 'teams', select: 'members,*' })
      ],
      create: [
        hooks.addRouteObject('primary', { service: 'teams', select: 'members,*' }),
        sanitize(accepts),
        validate(accepts)
      ],
      patch: [
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
      patch: [
        feeds.notify('team.invite.accept', notifiers),
      ],
      remove: [
        iff(hooks.isAction('reject'),
          feeds.notify('team.invite.reject', notifiers))
      ]
    }
  };
}