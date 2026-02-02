/**
 * Centralized error message utilities for consistent error messaging across the application.
 * All methods return string messages (not exceptions) for flexibility.
 */
export class ErrorMessages {
  /**
   * Standard "not found" error message
   * @param resource - The resource type (e.g., "Lead", "Contact", "Account")
   * @param id - The identifier that was not found
   * @returns Formatted error message
   */
  static notFound(resource: string, id: string | number): string {
    return `${resource} with ID ${id} was not found`;
  }

  /**
   * Standard "already exists" error message for duplicate resources
   * @param resource - The resource type (e.g., "Lead", "Contact")
   * @param field - The field that caused the conflict (e.g., "email", "name")
   * @param value - The value that already exists
   * @returns Formatted error message
   */
  static alreadyExists(resource: string, field: string, value: string): string {
    return `${resource} with ${field} ${value} already exists`;
  }

  /**
   * Validation error message for invalid input
   * @param field - The field that failed validation
   * @param reason - The reason for validation failure
   * @returns Formatted error message
   */
  static invalidInput(field: string, reason: string): string {
    return `Invalid ${field}: ${reason}`;
  }

  /**
   * Bulk operation failure message
   * @param resource - The resource type being operated on
   * @param count - The number of items that failed
   * @returns Formatted error message
   */
  static bulkOperationFailed(resource: string, count: number): string {
    return `Bulk operation failed: ${count} ${resource}(s) could not be processed`;
  }

  /**
   * Business rule violation message
   * @param rule - Description of the business rule that was violated
   * @returns Formatted error message
   */
  static businessRuleViolation(rule: string): string {
    return `Operation failed: ${rule}`;
  }

  /**
   * Custom error message for edge cases that don't fit standard patterns
   * @param message - The custom error message
   * @returns The message as-is
   */
  static custom(message: string): string {
    return message;
  }
}

