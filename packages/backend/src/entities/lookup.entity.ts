import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class LookupTable {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varbinary',
    length: 1024,
    nullable: false,
    unique: true,
  })
  point!: Buffer;

  @Column({
    type: 'varbinary',
    length: 1024,
    nullable: false,
    unique: true,
  })
  value!: Buffer;
}
