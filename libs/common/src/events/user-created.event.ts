/**
 * Event interface for user creation events
 * Published by Accounts service when a new user is registered
 * Consumed by CRM service to create corresponding user record
 */
export class UserCreatedEvent {
  id: string;
  workId: string;
  email: string;
  name: string;
  role: string;
  department: string;
}



