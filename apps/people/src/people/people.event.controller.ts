import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UserCreatedEvent } from '@app/common/events/user-created.event';
import type { UserUpdatedEvent } from '@app/common/events/user-updated.event';
import { UserDeletedEvent } from '@app/common/events/user-deleted.event';
import { PeopleService } from './people.service';

@Controller()
export class PeopleEventController {
  constructor(private readonly peopleService: PeopleService) {}

  @EventPattern('user.created')
  async handleUserCreated(@Payload() event: UserCreatedEvent) {
    await this.peopleService.createFromEvent(event);
  }

  @EventPattern('user.updated')
  async handleUserUpdated(@Payload() event: UserUpdatedEvent) {
    await this.peopleService.updateFromEvent(event);
  }

  @EventPattern('user.deleted')
  async handleUserDeleted(@Payload() event: UserDeletedEvent) {
    await this.peopleService.deleteFromEvent(event);
  }
}
