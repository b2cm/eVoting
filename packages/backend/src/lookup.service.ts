import { LookupTable } from './entities/lookup.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { toBufferBE, toBigIntBE } from 'bigint-buffer';
import { Connection, Repository } from 'typeorm';
import { Point } from 'elgammal';

@Injectable()
export class LookUpservice {
  constructor(
    @InjectRepository(LookupTable)
    private lookUpTableRep: Repository<LookupTable>,
    private connection: Connection,
  ) {}

  async add(value: bigint, point: Point) {

    console.log('mapping: ', value.toString(16), point.compressed.toString(16))

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
  async getAll() {
    const table = await this.lookUpTableRep.find();
    return table.map((mapping) => ({
      value: toBigIntBE(mapping.value).toString(16),
      point: toBigIntBE(mapping.point).toString(16),
    }));
  }
}
