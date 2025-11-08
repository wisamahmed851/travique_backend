import { Attraction } from "src/modules/attractions/entity/attraction.entity";
import { User } from "src/modules/users/entity/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('Favorite')
export class Favorite {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.favorite, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    user_id: number;

    @ManyToOne(() => Attraction, (attraction) => attraction.favorite)
    @JoinColumn({ name: 'attraction_id' })
    attraction: Attraction;

    @Column()
    attraction_id: number;

    @Column({
        type: 'smallint',
        default: 1,
        nullable: false,
    })
    status: number;

    @CreateDateColumn({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at: Date;
}