import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { UserCreatedEvent } from '@app/common/events/user-created.event';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  /**
   * Event handler for user.created events from RabbitMQ
   * This handler is triggered when a new user is registered in the Accounts service
   */
  @EventPattern('user.created')
  async handleUserCreated(@Payload() event: UserCreatedEvent) {
    try {
      this.logger.log(`✓ Received UserCreatedEvent for user: ${event.id} (${event.email})`);
      this.logger.debug(`Event data:`, JSON.stringify(event, null, 2));
      
      await this.usersService.createUserFromEvent(event);
      
      this.logger.log(`✓ Successfully processed UserCreatedEvent for user: ${event.id}`);
    } catch (error) {
      this.logger.error(`✗ Error handling UserCreatedEvent for user ${event.id}:`, error);
      this.logger.error(`Error stack:`, error.stack);
      // In a production system, you might want to implement retry logic or dead letter queue
      // Re-throw error so RabbitMQ knows the message processing failed
      throw error;
    }
  }
}
