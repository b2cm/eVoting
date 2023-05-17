import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Session } from './session.entity';

@Entity()
export class Candidate {
  @PrimaryColumn({
    type: 'varbinary',
    length: 1024,
  })
  message!: Buffer;

  @PrimaryColumn({
    type: 'char',
    length: 36,
  })
  sessionId!: string;

  @ManyToOne((t) => Session, (s) => s.candidates)
  @JoinColumn({ name: 'sessionId' })
  session!: Session;

  @Column()
  name!: string;
}
