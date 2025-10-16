import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
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

  @Column({ nullable: false })
  @Exclude()
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true, type: 'text' })
  address: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  street: string;

  @Column({ nullable: true })
  district: string;

  @Column({ nullable: true })
  image: string;

 /*  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    nullable: true,
    srid: 4326,
    comment: 'User location in longitude and latitude',
  })
  location: string; */

  @Column({nullable: true})
  longitude: string;

  @Column({nullable: true})
  latitude: string;

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

  @Column({
    type: 'smallint',
    default: 1,
    nullable: false,
    comment: '0 = not verified, 1 = verified',
  })
  isVarified: number;

  @Column({
    type: 'smallint',
    default: 1,
    nullable: false,
    comment: '1 for online and 0 for offline',
  })
  isOnline: number;

  @Column({ type: 'date' })
  created_at: string;

  @Column({ type: 'date' })
  updated_at: string;
  

  @BeforeInsert()
  setCreateDateParts() {
    const today = new Date();
    const onlyDate = today.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    this.created_at = onlyDate;
    this.updated_at = onlyDate;
  }

  @Column({ nullable: true })
  access_token: string;

  @Column({ nullable: true })
  refresh_token: string;

  @Column({ nullable: true })
  fcm_token: string;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];

}
