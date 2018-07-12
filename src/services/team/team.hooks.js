const { iff } = require('feathers-hooks-common');
const { associateCurrentUser, queryWithCurrentUser } = require('feathers-authentication-hooks');
const { hooks } = require('mostly-feathers-mongoose');
const { sanitize, validate } = require('mostly-feathers-validate');
const feeds = require('playing-feed-common');

const TeamEntity = require('../../entities/team.entity');
const notifiers = require('./team.notifiers');
const accepts = require('./team.accepts');

module.exports = function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth, 'scores,actions')
      ],
      create: [
        associateCurrentUser({ idField: 'id', as: 'owner' }),
        sanitize(accepts),
        validate(accepts),
      ],
      update: [
        sanitize(accepts),
        validate(accepts),
        hooks.discardFields('owner', 'createdAt', 'updatedAt', 'destroyedAt')
      ],
      patch: [
        iff(hooks.isAction('transfer'),
          hooks.addRouteObject('primary', { service: 'teams', field: 'id', select: 'members,*' })),
        sanitize(accepts),
        validate(accepts),
        hooks.discardFields('owner', 'createdAt', 'updatedAt', 'destroyedAt')
      ],
      remove: [
        hooks.addRouteObject('primary', { service: 'teams', field: 'id', select: 'members,*' })
      ]
    },
    after: {
      all: [
        hooks.presentEntity(TeamEntity, options.entities),
        hooks.responder()
      ],
      create: [
        feeds.notify('group.create', notifiers)
      ],
      patch: [
        iff(hooks.isAction('transfer'), feeds.notify('group.transfer', notifiers))
      ],
      remove: [
        feeds.notify('group.delete', notifiers)
      ]
    }
  };
};