import { iff, isProvider } from 'feathers-hooks-common';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import { hooks as feeds } from 'playing-feed-services';

import TeamEntity from '../../entities/team.entity';
import notifiers from './team.notifiers';

export default function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth, 'scores,actions')
      ],
      create: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'owner' }))
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
      remove: [
        feeds.notify('group.delete', notifiers)
      ]
    }
  };
}