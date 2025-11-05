import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { City } from 'src/modules/city/entity/city.entity';
import { AttractionCategory } from 'src/common/enums/attraction.enum';
import { AttractionImages } from './attraction_images.entity';
import { Review } from 'src/modules/review/entity/review.entity';

@Entity('attractions')
export class Attraction {
    @PrimaryGeneratedColumn('increment')
    id: number; // You can switch to 'uuid' if your DB uses UUIDs

    @ManyToOne(() => City, (city) => city.attractions, {
        onDelete: 'CASCADE', // Deletes attractions if the city is deleted
        eager: false, // Load only when needed
    })
    @JoinColumn({ name: 'city_id' })
    city: City;

    @Column({ name: 'city_id' })
    city_id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({
        type: 'enum',
        enum: AttractionCategory,
    })
    category: AttractionCategory;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    main_image?: string;

    @OneToMany(() => AttractionImages, (attractionImages) => attractionImages.attraction)
    images: AttractionImages[];

    @Column({ type: 'varchar', length: 255, nullable: true })
    contact_info?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    opening_hours?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    website_url?: string;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 6,
        nullable: true,
    })
    latitude?: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 6,
        nullable: true,
    })
    longitude?: number;

    @Column({
        type: 'decimal',
        precision: 2,
        scale: 1,
        default: 0.0,
    })
    average_rating: number;

    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;

    @UpdateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    updated_at: Date;

    @OneToMany(() => Review, (review) => review.attraction)
    reviews: Review;
}
