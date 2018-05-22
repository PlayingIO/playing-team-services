import { iff } from 'feathers-hooks-common';
import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';
import { sanitize, validate } from 'mostly-feathers-validate';
import { hooks as feeds } from 'playing-feed-services';

import accepts from './team-member.accepts';

export default function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        cache(options.cache)
      ],
      find: [
        hooks.addRouteObject('team', { service: 'teams' })
      ],
      get: [
        hooks.addRouteObject('team', { service: 'teams' })
      ],
      create: [
        hooks.addRouteObject('team', { service: 'teams' }),
        sanitize(accepts),
        validate(accepts),
      ],
    },
    after: {
      all: [
        cache(options.cache),
        hooks.responder()
      ]
    }
  };
}