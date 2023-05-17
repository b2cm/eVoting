import {Column, Entity, PrimaryColumn} from 'typeorm';

@Entity()
export class HashedId {

    @PrimaryColumn({
        type: 'varbinary',
        length: 1024,
        nullable: false,
        unique: true,
    })
    Hash!: Buffer;

    @Column({
        type: 'varbinary',
        length: 1024,
        nullable: false,
        unique: true,
    })
    PubKey!: Buffer;


}