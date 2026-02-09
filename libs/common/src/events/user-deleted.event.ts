/**
 * Event payload for user deletion.
 * Published by Accounts when a user is deleted or deactivated.
 * Consumed by People to deactivate or remove the local copy.
 */
export class UserDeletedEvent {
  id: string; // Accounts user id
}
