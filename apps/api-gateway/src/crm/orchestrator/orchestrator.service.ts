import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Metadata } from '@grpc/grpc-js';
import type {
  Empty,
  ConvertLeadToContactRequest,
  AccountFormOptionsResponse,
  ContactLeadFormOptionsResponse,
  RegisterFormOptionsResponse,
  DealFormOptionsResponse,
  ActivityFormOptionsResponse,
  DeliveryNoteFormOptionsResponse,
  RfqFormOptionsResponse,
  ContactResponse,
} from '@app/common/types/orchestrator';

interface OrchestratorGrpcService {
  getAccountFormOptions(data: Empty): Observable<AccountFormOptionsResponse>;
  getContactLeadFormOptions(data: Empty): Observable<ContactLeadFormOptionsResponse>;
  getRegisterFormOptions(data: Empty): Observable<RegisterFormOptionsResponse>;
  getDealFormOptions(data: Empty): Observable<DealFormOptionsResponse>;
  getActivityFormOptions(data: Empty): Observable<ActivityFormOptionsResponse>;
  getDeliveryNoteFormOptions(data: Empty): Observable<DeliveryNoteFormOptionsResponse>;
  getRfqFormOptions(data: Empty): Observable<RfqFormOptionsResponse>;
  convertLeadToContact(data: ConvertLeadToContactRequest, metadata?: Metadata): Observable<ContactResponse>;
}

@Injectable()
export class OrchestratorService implements OnModuleInit {
  private orchestratorGrpcService: OrchestratorGrpcService;

  constructor(@Inject('CRM_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.orchestratorGrpcService = this.client.getService<OrchestratorGrpcService>('OrchestratorService');
  }

  getAccountFormOptions(): Observable<AccountFormOptionsResponse> {
    const request: Empty = {};
    return this.orchestratorGrpcService.getAccountFormOptions(request).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error in getAccountFormOptions gRPC call:', error);
        return throwError(() => error);
      })
    );
  }

  getContactLeadFormOptions(): Observable<ContactLeadFormOptionsResponse> {
    const request: Empty = {};
    return this.orchestratorGrpcService.getContactLeadFormOptions(request).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error in getContactLeadFormOptions gRPC call:', error);
        return throwError(() => error);
      })
    );
  }

  getRegisterFormOptions(): Observable<RegisterFormOptionsResponse> {
    const request: Empty = {};
    return this.orchestratorGrpcService.getRegisterFormOptions(request).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error in getRegisterFormOptions gRPC call:', error);
        return throwError(() => error);
      })
    );
  }

  getDealFormOptions(): Observable<DealFormOptionsResponse> {
    const request: Empty = {};
    return this.orchestratorGrpcService.getDealFormOptions(request).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error in getDealFormOptions gRPC call:', error);
        return throwError(() => error);
      })
    );
  }

  getActivityFormOptions(): Observable<ActivityFormOptionsResponse> {
    const request: Empty = {};
    return this.orchestratorGrpcService.getActivityFormOptions(request).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error in getActivityFormOptions gRPC call:', error);
        return throwError(() => error);
      })
    );
  }

  getDeliveryNoteFormOptions(): Observable<DeliveryNoteFormOptionsResponse> {
    const request: Empty = {};
    return this.orchestratorGrpcService.getDeliveryNoteFormOptions(request).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error in getDeliveryNoteFormOptions gRPC call:', error);
        return throwError(() => error);
      })
    );
  }

  getRfqFormOptions(): Observable<RfqFormOptionsResponse> {
    const request: Empty = {};
    return this.orchestratorGrpcService.getRfqFormOptions(request).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error in getRfqFormOptions gRPC call:', error);
        return throwError(() => error);
      })
    );
  }

  convertLeadToContact(
    leadId: string,
    currentUser: { id: string; name: string; email: string },
  ): Observable<ContactResponse> {
    const request: ConvertLeadToContactRequest = { leadId };
    const metadata = this.createUserMetadata(currentUser);
    return this.orchestratorGrpcService.convertLeadToContact(request, metadata).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error in convertLeadToContact gRPC call:', error);
        return throwError(() => error);
      })
    );
  }

  private createUserMetadata(user: { id: string; name: string; email: string }): Metadata {
    const metadata = new Metadata();
    metadata.add('user-id', user.id);
    metadata.add('user-name', user.name);
    metadata.add('user-email', user.email);
    return metadata;
  }
}

