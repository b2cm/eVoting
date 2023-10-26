import { LookupTable } from './entities/lookup.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { toBufferBE, toBigIntBE } from 'bigint-buffer';
import { Connection, Repository } from 'typeorm';
import { Point } from 'elgammal';
import { sha256 } from 'js-sha256';

/**
 *
 *
 * @export
 * @class LookUpservice
 * @typedef {LookUpservice}
 */
@Injectable()
export class LookUpservice {
  /**
   * Creates an instance of LookUpservice.
   *
   * @constructor
   * @param {Repository<LookupTable>} lookUpTableRep
   * @param {Connection} connection
   */
  constructor(
    @InjectRepository(LookupTable)
    private lookUpTableRep: Repository<LookupTable>,
    private connection: Connection,
  ) {}

  /**
   * This function adds lookup table entries to the database
   *
   * @async
   * @param {bigint} value
   * @param {Point} point
   * @returns {*}
   *
   */
  async add(value: bigint, point: Point) {
    console.log('mapping: ', value.toString(16), point.compressed.toString(16));

    const LookUpEntry = new LookupTable();
    LookUpEntry.value = toBufferBE(value, 1024);
    LookUpEntry.point = toBufferBE(point.compressed, 1024);

    await this.connection
      .createQueryBuilder()
      .insert()
      .into(LookupTable)
      .values(LookUpEntry)
      .orIgnore()
      .execute();
  }
  /**
   * Returns all the lookup table entries
   *
   * @async
   * @returns { Promise<{
    value: string;
    point: string;
}[]>}
   */
  async getAll() {
    const table = await this.lookUpTableRep.find();
    return table.map((mapping) => ({
      value: toBigIntBE(mapping.value).toString(16),
      point: toBigIntBE(mapping.point).toString(16),
    }));
  }

  /**
   * Calculate and return hash of lookup table 
   */
  async hashLookUpTable() {
    const table = await this.lookUpTableRep.find();

    const hash = sha256.create();
    for (const { value, point } of table) {
      hash.update(value).update(point);
    }

    return hash.hex();
  }
}
