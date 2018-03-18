import Entity from 'mostly-entity';
import { entities as contents } from 'playing-content-services';

const TeamEntity = new Entity('Team', {
  image: { using: contents.BlobEntity }
});

TeamEntity.excepts('updatedAt', 'destroyedAt');

export default TeamEntity.asImmutable();
