import { Injectable } from '@nestjs/common';

@Injectable()
export class CrmService {
  getHello(): string {
    return 'Hello World!';
  }
}
