import { Injectable } from '@nestjs/common';

@Injectable()
export class DeskService {
  getHello(): string {
    return 'Hello World!';
  }
}
