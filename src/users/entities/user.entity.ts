import { Exclude } from "class-transformer";
import { Product } from "src/products/entities/product.entity";
import { Review } from "src/reviews/entities/review.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { userRole } from "utils/constants";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 50, nullable: true })
    username: string;

    @Column({ type: 'varchar', length: 250, unique: true })
    email: string;

    @Column()
    @Exclude()
    password: string;

    @Column({ type: 'int', nullable: true })
    cin: number;

    @Column({ type: 'varchar', length: 16, nullable: true })
    rib: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    banque: string;

    @Column({ type: 'varchar', length: 8, nullable: true })
    phone: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    specialite: string;

    @Column({ type: 'enum', enum: userRole, default: userRole.USER })
    role: userRole;

    @Column({ type: 'boolean', default: false })
    isVerified: boolean;

    @Column({ nullable: true })
    verificationToken: string;

    @Column({ nullable: true })
    resetPasswordToken: string;

    @Column({ nullable: true, default: null })
    profileImage: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Product, product => product.user)
    products: Product[];

    @OneToMany(() => Review, review => review.user)
    reviews: Review[];

}