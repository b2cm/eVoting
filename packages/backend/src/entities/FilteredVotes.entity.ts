import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class FilteredVotes {
  @PrimaryColumn({
    type: 'varbinary',
    length: 1024,
    nullable: false,
    unique: true,
  })
  partyID!: Buffer;

  @Column({
    type: 'varbinary',
    length: 1024,
    nullable: false,
    unique: true,
  })
  votes!: Buffer;

  @Column({
    type: 'varbinary',
    length: 1024,
    nullable: false,
    unique: false,
  })
  counters!: Buffer;
}
