import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InstallationBaseService } from './installation-base.service';
import { CreateInstallationBaseDto } from './dto/create-installation-base.dto';
import { UpdateInstallationBaseDto } from './dto/update-installation-base.dto';

@Controller('installation-base')
export class InstallationBaseController {
  constructor(
    private readonly installationBaseService: InstallationBaseService,
  ) {}

  @Get()
  findAll(
    @Query('sort') sort?: string,
    @Query('account_id') account_id?: string,
  ) {
    return this.installationBaseService.findAll(account_id, sort);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.installationBaseService.findOne(id);
  }

  @Post()
  create(@Body() createInstallationBaseDto: CreateInstallationBaseDto) {
    return this.installationBaseService.create(createInstallationBaseDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateInstallationBaseDto: UpdateInstallationBaseDto,
  ) {
    return this.installationBaseService.update(id, updateInstallationBaseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.installationBaseService.remove(id);
  }
}

