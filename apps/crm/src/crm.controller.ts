import { Controller, Get } from '@nestjs/common';
import { CrmService } from './crm.service';

@Controller()
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get()
  getHello(): string {
    return this.crmService.getHello();
  }
}
