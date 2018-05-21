import Entity from 'mostly-entity';
import { entities as contents } from 'playing-content-services';

const TeamDesignEntity = new Entity('TeamDesign', {
  image: { using: contents.BlobEntity }
});

TeamDesignEntity.excepts('updatedAt', 'destroyedAt');

export default TeamDesignEntity.asImmutable();
