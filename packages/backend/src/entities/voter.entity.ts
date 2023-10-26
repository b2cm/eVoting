import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Voter {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'varbinary',
    length: 1024,
    nullable: false,
    unique: true,
  })
  pubKey!: Buffer;

  @Column({
    type: 'varbinary',
    length: 1024,
    nullable: false,
    unique: true,
  })
  voterID!: Buffer;

  @Column({
    type: 'varbinary',
    length: 1024,
    nullable: false,
    unique: true,
  })
  counter!: Buffer;

  @Column({
    type: 'char',
    length: 36,
    nullable: false,
  })
  groupId!: string;
}
