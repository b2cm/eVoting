import { Column, Entity, PrimaryColumn } from 'typeorm';
import { HashedId } from './HashedId.entity';

@Entity()
export class Token {
  @Column({
    type: 'varbinary',
    length: 1024,
    nullable: false,
  })
  vid!: Buffer;

  @PrimaryColumn({
    type: 'varbinary',
    length: 1024,
    nullable: false,
    unique: true,
  })
  counter!: Buffer;

  @Column({
    type: 'varbinary',
    length: 1024,
    nullable: false,
  })
  HashedId!: Buffer;

 
}
