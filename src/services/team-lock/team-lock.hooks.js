const { hooks } = require('mostly-feathers-mongoose');
const { cache } = require('mostly-feathers-cache');
const feeds = require('playing-feed-common');
const { authorize } = require('playing-permissions');

const notifiers = require('./team-lock.notifiers');

module.exports = function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        authorize('team', { primary: { field: 'primary' } }), // check permission on primary team
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
};