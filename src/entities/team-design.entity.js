const Entity = require('mostly-entity');
const { BlobEntity } = require('playing-content-common');

const TeamDesignEntity = new Entity('TeamDesign', {
  image: { using: BlobEntity }
});

TeamDesignEntity.discard('_id');

module.exports = TeamDesignEntity.freeze();
