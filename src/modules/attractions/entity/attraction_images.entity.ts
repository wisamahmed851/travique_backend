import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Attraction } from "./attraction.entity";

@Entity({ name: 'attractions_images' })
export class AttractionImages {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Attraction, (attraction) => attraction.images, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'attraction_id' })
    attraction: Attraction;

    @Column()
    attraction_id: number;

    @Column({ type: 'varchar', length: 255 })
    image_url: string; // ✅ Add this line
}