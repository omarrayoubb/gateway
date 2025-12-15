import { Test, TestingModule } from '@nestjs/testing';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';

describe('CrmController', () => {
  let crmController: CrmController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CrmController],
      providers: [CrmService],
    }).compile();

    crmController = app.get<CrmController>(CrmController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(crmController.getHello()).toBe('Hello World!');
    });
  });
});
