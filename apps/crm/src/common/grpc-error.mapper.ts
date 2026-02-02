import { HttpStatus, HttpException, BadRequestException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { ValidationError } from '@app/common/errors';

/**
 * Maps HTTP exceptions to gRPC error codes and formats
 * Handles validation errors by preserving field-level details through gRPC metadata
 */
export class GrpcErrorMapper {
  /**
   * Maps HTTP status codes to gRPC error codes
   * Reference: https://grpc.github.io/grpc/core/md_doc_statuscodes.html
   */
  private static readonly HTTP_TO_GRPC_MAP: Record<number, number> = {
    [HttpStatus.BAD_REQUEST]: 3,      // INVALID_ARGUMENT
    [HttpStatus.UNAUTHORIZED]: 16,     // UNAUTHENTICATED
    [HttpStatus.FORBIDDEN]: 7,         // PERMISSION_DENIED
    [HttpStatus.NOT_FOUND]: 5,         // NOT_FOUND
    [HttpStatus.CONFLICT]: 6,          // ALREADY_EXISTS
    [HttpStatus.INTERNAL_SERVER_ERROR]: 2, // UNKNOWN
  };

  /**
   * Converts an HTTP exception to a gRPC exception
   * Preserves validation errors in metadata for field-level error handling
   * 
   * @param error - The HTTP exception or any error
   * @returns RpcException with proper gRPC error code and message
   */
  static fromHttpException(error: any): RpcException {
    // If it's already an RpcException, return as-is
    if (error instanceof RpcException) {
      return error;
    }

    // Extract HTTP status code
    const httpStatus = error instanceof HttpException 
      ? error.getStatus() 
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Map to gRPC error code
    const grpcCode = this.HTTP_TO_GRPC_MAP[httpStatus] || 2; // Default to UNKNOWN

    // Extract error message
    const errorResponse = error instanceof HttpException 
      ? error.getResponse() 
      : { message: error.message || 'An error occurred' };

    // Handle both string and object responses
    const message = typeof errorResponse === 'string' 
      ? errorResponse 
      : (errorResponse as any)?.message || error.message || 'An error occurred';

    // CRITICAL: Handle validation errors (BadRequestException with validation array)
    if (error instanceof BadRequestException) {
      const response = error.getResponse();
      
      // Check if response contains validation errors array
      if (typeof response === 'object' && response !== null) {
        const validationErrors = (response as any).message;
        
        // If message is an array, it's likely validation errors
        if (Array.isArray(validationErrors)) {
          const validationErrorsArray: ValidationError[] = validationErrors.map((err: any) => {
            // Handle class-validator format: "field should be..."
            if (typeof err === 'string') {
              // Try to extract field name from message
              const fieldMatch = err.match(/^(\w+)\s/);
              return {
                field: fieldMatch ? fieldMatch[1] : 'unknown',
                message: err,
              };
            }
            // Handle object format: { field: "email", message: "..." }
            return {
              field: err.property || err.field || 'unknown',
              message: err.constraints ? Object.values(err.constraints)[0] : err.message || err,
              value: err.value,
            };
          });

          // Serialize validation errors and attach to gRPC metadata
          const metadata = new Metadata();
          metadata.set('validation-errors', JSON.stringify(validationErrorsArray));
          
          return new RpcException({
            code: grpcCode,
            message: 'Validation failed',
            details: JSON.stringify(validationErrorsArray),
          });
        }
      }
    }

    // For other errors, create standard RpcException
    return new RpcException({
      code: grpcCode,
      message: message,
    });
  }

  /**
   * Maps HTTP status code to gRPC error code
   * @param httpStatus - HTTP status code
   * @returns gRPC error code
   */
  static mapHttpToGrpc(httpStatus: number): number {
    return this.HTTP_TO_GRPC_MAP[httpStatus] || 2; // Default to UNKNOWN
  }
}

