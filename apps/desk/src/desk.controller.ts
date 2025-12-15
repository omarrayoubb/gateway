import { Controller, Get } from '@nestjs/common';
import { DeskService } from './desk.service';

@Controller()
export class DeskController {
  constructor(private readonly deskService: DeskService) {}

  @Get()
  getHello(): string {
    return this.deskService.getHello();
  }
}
