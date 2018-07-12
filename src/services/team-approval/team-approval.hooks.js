const { iff } = require('feathers-hooks-common');
const { hooks } = require('mostly-feathers-mongoose');
const { cache } = require('mostly-feathers-cache');
const { sanitize, validate } = require('mostly-feathers-validate');
const feeds = require('playing-feed-common');

const accepts = require('./team-approval.accepts');
const notifiers = require('./team-approval.notifiers');

module.exports = function (options = {}) {
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
        sanitize(accepts),
        validate(accepts)
      ],
      remove: [
        hooks.addRouteObject('primary', { service: 'teams' }),
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
        feeds.notify('team.accept', notifiers)
      ],
      remove: [
        iff(hooks.isAction('reject'),
          feeds.notify('team.reject', notifiers))
      ]
    }
  };
};