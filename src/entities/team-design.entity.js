import Entity from 'mostly-entity';
import { BlobEntity } from 'playing-content-common';

const TeamDesignEntity = new Entity('TeamDesign', {
  image: { using: BlobEntity }
});

TeamDesignEntity.discard('_id');

export default TeamDesignEntity.asImmutable();
