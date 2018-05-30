import Entity from 'mostly-entity';
import { BlobEntity } from 'playing-content-common';

const TeamDesignEntity = new Entity('TeamDesign', {
  image: { using: BlobEntity }
});

TeamDesignEntity.excepts('updatedAt', 'destroyedAt');

export default TeamDesignEntity.asImmutable();
