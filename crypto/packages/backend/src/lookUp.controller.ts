import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { LookUpservice } from './lookup.service';

@Controller('Lookup')
export class LookUpController {
  constructor(private lookUpService: LookUpservice) {}

  @Get()
  async GetTable() {
    const table = await this.lookUpService.getAll();
    return table;
  }
}
