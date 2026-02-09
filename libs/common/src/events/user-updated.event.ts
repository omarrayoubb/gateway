/**
 * Event payload for user profile updates.
 * Same shape as UserCreatedEvent so People can overwrite its copy.
 * Published by Accounts after updateProfile; consumed by People.
 */
import { UserCreatedEvent } from './user-created.event';

export type UserUpdatedEvent = UserCreatedEvent;
