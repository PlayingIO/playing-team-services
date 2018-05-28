import { iff, isProvider } from 'feathers-hooks-common';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import { sanitize, validate } from 'mostly-feathers-validate';
import { hooks as feeds } from 'playing-feed-services';

import TeamEntity from '../../entities/team.entity';
import notifiers from './team.notifiers';
import accepts from './team.accepts';

export default function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth, 'scores,actions')
      ],
      create: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'owner' })),
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
}