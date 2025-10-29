// user.entity.ts
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { City } from 'src/modules/city/entity/city.entity';
import { UserRole } from 'src/modules/assig-roles-user/entity/user-role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: true })
  @Exclude()
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, type: 'text' })
  address: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  city_id: number;

  @ManyToOne(() => City, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column({
    type: 'smallint',
    default: 1,
    nullable: false,
    comment: '0 = inactive, 1 = active',
  })
  status: number;

  // ✅ account verification status
  @Column({
    type: 'boolean',
    default: false,
    comment: 'true = verified, false = not verified',
  })
  is_verified: boolean;

  // ✅ OTP for verification
  @Column({ nullable: true })
  otp: string;

  // ✅ OTP expiration timestamp
  @Column({ type: 'timestamp', nullable: true })
  otp_expiration: Date;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  access_token: string;

  @Column({ nullable: true })
  refresh_token: string;

  @Column({ type: 'date' })
  created_at: string;

  @Column({ type: 'date' })
  updated_at: string;

  @BeforeInsert()
  setCreateDateParts() {
    const today = new Date();
    const onlyDate = today.toISOString().split('T')[0];
    this.created_at = onlyDate;
    this.updated_at = onlyDate;
  }

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];
}
