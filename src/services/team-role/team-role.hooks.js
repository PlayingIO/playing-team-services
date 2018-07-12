const { hooks } = require('mostly-feathers-mongoose');
const { cache } = require('mostly-feathers-cache');
const { sanitize, validate } = require('mostly-feathers-validate');
const feeds = require('playing-feed-common');

const accepts = require('./team-role.accepts');
const notifiers = require('./team-role.notifiers');

module.exports = function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        cache(options.cache)
      ],
      patch: [
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
        feeds.notify('team.roles', notifiers),
      ]
    }
  };
};