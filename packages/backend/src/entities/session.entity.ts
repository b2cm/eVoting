import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Candidate } from './candidate.entity';

@Entity({
  name: 'VoteSession',
})
export class Session {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ type: 'varbinary', length: 1024, nullable: false })
  pubKey!: Buffer;

  @OneToMany((t) => Candidate, (c) => c.session)
  candidates!: Candidate[];
}
