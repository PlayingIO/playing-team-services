const Entity = require('mostly-entity');
const { entities: users } = require('playing-user-services');

const TeamEntity = users.group.extend('TeamEntity');

module.exports = TeamEntity.freeze();
