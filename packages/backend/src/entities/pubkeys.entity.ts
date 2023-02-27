import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class pubkeys {
  @PrimaryColumn({
    type: 'varbinary',
    length: 1024,
    nullable: false,
    unique: true,
  })
  partyid!: Buffer;

  @Column({
    type: 'varbinary',
    length: 1024,
    nullable: false,
    unique: true,
  })
  Tallypubkey!: Buffer;

  @Column({
    type: 'varbinary',
    length: 1024,
    nullable: false,

  })
  sessionId!: Buffer;
}
