import { Test, TestingModule } from '@nestjs/testing';
import { DeskController } from './desk.controller';
import { DeskService } from './desk.service';

describe('DeskController', () => {
  let deskController: DeskController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [DeskController],
      providers: [DeskService],
    }).compile();

    deskController = app.get<DeskController>(DeskController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(deskController.getHello()).toBe('Hello World!');
    });
  });
});
