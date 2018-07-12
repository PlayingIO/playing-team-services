const { iff } = require('feathers-hooks-common');
const { hooks } = require('mostly-feathers-mongoose');
const { cache } = require('mostly-feathers-cache');
const { sanitize, validate } = require('mostly-feathers-validate');
const feeds = require('playing-feed-common');

const accepts = require('./team-member.accepts');
const notifiers = require('./team-member.notifiers');

module.exports = function (options = {}) {
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
};