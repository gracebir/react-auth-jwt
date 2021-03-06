import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";
import { ObjectType, Field } from "type-graphql";

@ObjectType()
@Entity('users')
export class User extends BaseEntity {

    @Field()
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column('text')
    name: string;

    @Field()
    @Column('text')
    email: string;

    @Column('text')
    password: string;

    @Column('int', {default: 0})
    tokenVersion : number;

}
