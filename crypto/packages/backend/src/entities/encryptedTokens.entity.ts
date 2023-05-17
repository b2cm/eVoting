import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class encryptedTokens {
  
  @PrimaryGeneratedColumn('increment')
  id!: number;

  
  @Column({
    type: 'varbinary',
    length: 1024,
    nullable: false,
    default: () => '0x' + Buffer.alloc(1024).toString('hex')
   
  })
  encryptedCounter!: Buffer;

  @Column({
    type: 'varbinary',
    length: 1024,
    nullable: false,
    default: () => '0x' + Buffer.alloc(1024).toString('hex')

  })
  encryptedVid!: Buffer;

  @Column({
    type: 'varbinary',
    length: 1024,
    nullable: false,
    default: () => '0x' + Buffer.alloc(1024).toString('hex')
  })
  HashedId!: Buffer;

  @Column({
    type: 'varbinary',
    length: 1024,
    nullable: false,
    unique: true,
    default: () => '0x' + Buffer.alloc(1024).toString('hex')
  })
  signature!: Buffer;

  @Column({
    type: 'varbinary',
    length: 1024,
    nullable: false,
  })
  counterIndex!: Number;

  @Column({
    type: 'varchar',
    length: 1024,
    default : ""
  
  }) 
  pubkey!: string;
}
