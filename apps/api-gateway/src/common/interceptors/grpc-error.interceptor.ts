import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RpcException } from '@nestjs/microservices';
import { ErrorResponseDto, ValidationError } from '@app/common/errors';

/**
 * Global interceptor that transforms gRPC errors to HTTP exceptions
 * with standardized error response format
 */
@Injectable()
export class GrpcErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Transform gRPC errors to HTTP exceptions
        if (error instanceof RpcException || error.code) {
          const grpcCode = error.code || 2;
          const message = error.message || 'An error occurred';
          
          // Map gRPC code to HTTP status
          const httpStatus = this.mapGrpcToHttp(grpcCode);
          
          // Extract validation errors from error details if present
          let validationErrors: ValidationError[] | undefined;
          if (error.details) {
            try {
              // Try to parse details as JSON (validation errors array)
              const parsed = JSON.parse(error.details);
              if (Array.isArray(parsed)) {
                validationErrors = parsed;
              }
            } catch {
              // If parsing fails, details is just a string - ignore
            }
          }
          
          // Get request path for error response
          const request = context.switchToHttp().getRequest();
          const path = request?.url || request?.path || 'unknown';
          
          // Create standardized error response
          const errorResponse: ErrorResponseDto = {
            statusCode: httpStatus,
            message: validationErrors ? 'Validation failed' : message,
            error: this.getErrorName(httpStatus),
            timestamp: new Date().toISOString(),
            path: path,
            ...(validationErrors && { validationErrors }),
          };
          
          throw new HttpException(errorResponse, httpStatus);
        }
        
        // If it's already an HttpException, re-throw as-is
        if (error instanceof HttpException) {
          return throwError(() => error);
        }
        
        // For unknown errors, wrap in 500 Internal Server Error
        const request = context.switchToHttp().getRequest();
        const path = request?.url || request?.path || 'unknown';
        
        const errorResponse: ErrorResponseDto = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Internal server error',
          error: 'Internal Server Error',
          timestamp: new Date().toISOString(),
          path: path,
        };
        
        throw new HttpException(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
      }),
    );
  }

  /**
   * Maps gRPC error codes to HTTP status codes
   * Reference: https://grpc.github.io/grpc/core/md_doc_statuscodes.html
   */
  private mapGrpcToHttp(grpcCode: number): HttpStatus {
    const mapping: Record<number, HttpStatus> = {
      3: HttpStatus.BAD_REQUEST,      // INVALID_ARGUMENT
      5: HttpStatus.NOT_FOUND,        // NOT_FOUND
      6: HttpStatus.CONFLICT,          // ALREADY_EXISTS
      7: HttpStatus.FORBIDDEN,         // PERMISSION_DENIED
      16: HttpStatus.UNAUTHORIZED,     // UNAUTHENTICATED
    };
    return mapping[grpcCode] || HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Gets human-readable error name from HTTP status code
   */
  private getErrorName(status: HttpStatus): string {
    const names: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.NOT_FOUND]: 'Not Found',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    };
    return names[status] || 'Error';
  }
}

