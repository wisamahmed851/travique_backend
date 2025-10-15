import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

Entity();
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({})
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({nullable: false  })
  password: string;

  @Column({ nullable: true})
  profile_image: string;

  role
}
