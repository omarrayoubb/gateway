import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';

@Module({
  imports: [
    // Client is registered in CrmModule
  ],
  controllers: [ContactsController],
  providers: [ContactsService],
})
export class ContactsModule { }
