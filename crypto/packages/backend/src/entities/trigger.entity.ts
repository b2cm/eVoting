import { BaseEntity, Check, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Trigger extends BaseEntity {
  @PrimaryColumn({ type: 'int', default: 0, nullable: false })
  val!: number;

  @Column({ type: 'varchar', length: 256, nullable: false })
  name!: string;
}
