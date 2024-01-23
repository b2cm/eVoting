import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';

import { LookUpservice } from './lookup.service';

/**
 *
 *
 * @export
 * @class LookUpController
 * @typedef {LookUpController}
 */
@Controller('Lookup')
export class LookUpController {
  /**
   * Creates an instance of LookUpController.
   *
   * @constructor
   * @param {LookUpservice} lookUpService
   */
  constructor(private lookUpService: LookUpservice) {}

  /**
   *
   *
   * @async
   * @returns {LookupTable}
   */
  @Get()
  async GetTable() {
    const table = await this.lookUpService.getAll();
    return table;
  }

  @Get('Hash')
  async GetTableHash() {
    return this.lookUpService.hashLookUpTable();
  }
}
