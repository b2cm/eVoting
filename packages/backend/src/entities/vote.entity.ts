import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Session } from './session.entity';

@Entity()
export class Vote {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'char',
    length: 36,
    nullable: false,
  })
  sessionId!: string;

  @ManyToOne((t) => Session, (s) => s)
  @JoinColumn({ name: 'sessionId' })
  session!: Session;

  @Column({
    type: 'char',
    length: 36,
    nullable: false,
  })
  groupId!: string;

  @Column({
    type: 'varbinary',
    length: 4096,
    nullable: false,
  })
  vote!: Buffer;

  //signature
  @Column({
    type: 'varbinary',
    length: 1024,
    nullable: false,
  })
  y0!: Buffer;

  @Column({
    type: 'varbinary',
    length: 1024,
    nullable: false,
  })
  s!: Buffer;

  // @Column({
  //   type: 'varbinary',
  //   length: 1024,
  //   nullable: false,
  // })
  // counter!: Buffer;

  // @Column({
  //   type: 'varbinary',
  //   length: 1024,
  //   nullable: false,
  // })
  // voterID!: Buffer;

  @Column({
    type: 'varbinary',
    length: 4096,
    nullable: false,
  })
  token!: Buffer;

  @OneToMany((t) => SignatureC, (c) => c.vote)
  c!: SignatureC[];

  //proof
  @OneToMany(() => Proof, (p) => p.vote)
  proofs!: Proof[];
}

@Entity()
export class SignatureC {
  @PrimaryGeneratedColumn({ name: 'singatureId' })
  idx!: number;

  @Column({
    type: 'varbinary',
    length: 1024,
    nullable: false,
  })
  c!: Buffer;

  @ManyToOne(() => Vote, (v) => v.c)
  vote!: Vote;
}

@Entity()
export class Proof {
  @PrimaryGeneratedColumn({ name: 'proofId' })
  idx!: number;

  @Column({
    type: 'varbinary',
    length: 1024,
    nullable: false,
  })
  p!: Buffer;

  @ManyToOne(() => Vote, (v) => v.proofs)
  vote!: Vote;

  @Column()
  order!: number;

  @Column()
  sign!: number;
}
