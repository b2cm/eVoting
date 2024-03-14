import {Column, Entity, PrimaryColumn} from 'typeorm';

@Entity()
export class Limit {

    @PrimaryColumn({
        type: 'varbinary',
        length: 1024,
        nullable: false,
        unique: true,
    })
    HashedId!: Buffer;

    @Column({
        type: 'varchar',
        length: 256,
        nullable: false,
       
    })
    limit!: Number;


}