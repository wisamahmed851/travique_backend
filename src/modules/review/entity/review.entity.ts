import { Attraction } from 'src/modules/attractions/entity/attraction.entity';
import { User } from 'src/modules/users/entity/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @ManyToOne(() => Attraction, (attraction) => attraction.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'attraction_id' })
  attraction: Attraction;

  @Column()
  attraction_id: number;

  @Column({ type: 'int', width: 1 })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'int', default: 0 })
  likes: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
