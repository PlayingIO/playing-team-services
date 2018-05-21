import Entity from 'mostly-entity';
import { entities as users } from 'playing-user-services';

const TeamEntity = users.group.extend('TeamEntity');

export default TeamEntity.asImmutable();
