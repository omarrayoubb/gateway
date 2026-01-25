import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
  SalesOrderFormOptionsResponse,
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
  getSalesOrderFormOptions(data: Empty): Observable<SalesOrderFormOptionsResponse>;
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
    );
  }

  getContactLeadFormOptions(): Observable<ContactLeadFormOptionsResponse> {
    const request: Empty = {};
    return this.orchestratorGrpcService.getContactLeadFormOptions(request).pipe(
      map(response => response),
    );
  }

  getRegisterFormOptions(): Observable<RegisterFormOptionsResponse> {
    const request: Empty = {};
    return this.orchestratorGrpcService.getRegisterFormOptions(request).pipe(
      map(response => response),
    );
  }

  getDealFormOptions(): Observable<DealFormOptionsResponse> {
    const request: Empty = {};
    return this.orchestratorGrpcService.getDealFormOptions(request).pipe(
      map(response => response),
    );
  }

  getActivityFormOptions(): Observable<ActivityFormOptionsResponse> {
    const request: Empty = {};
    return this.orchestratorGrpcService.getActivityFormOptions(request).pipe(
      map(response => response),
    );
  }

  getDeliveryNoteFormOptions(): Observable<DeliveryNoteFormOptionsResponse> {
    const request: Empty = {};
    return this.orchestratorGrpcService.getDeliveryNoteFormOptions(request).pipe(
      map(response => response),
    );
  }

  getRfqFormOptions(): Observable<RfqFormOptionsResponse> {
    const request: Empty = {};
    return this.orchestratorGrpcService.getRfqFormOptions(request).pipe(
      map(response => response),
    );
  }

  getSalesOrderFormOptions(): Observable<SalesOrderFormOptionsResponse> {
    const request: Empty = {};
    return this.orchestratorGrpcService.getSalesOrderFormOptions(request).pipe(
      map(response => response),
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
    );
  }

  private createUserMetadata(user: { id: string; name: string; email: string }): Metadata {
    // Handle undefined user
    const safeUser = user || { id: 'system', name: 'System User', email: 'system@example.com' };
    const metadata = new Metadata();
    metadata.add('user-id', safeUser.id);
    metadata.add('user-name', safeUser.name);
    metadata.add('user-email', safeUser.email);
    return metadata;
  }
}

