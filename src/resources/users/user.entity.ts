import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number

    @Column("text")
    password!: string

    @Column("text", {unique: true})
    email!: string

    @Column("text")
    firstName!: string

    @Column("text")
    lastName!: string

    @Column("text", {default: null})
    image!: string

    @Column("bytea", {default: null})
    pdf!: Buffer
}