import { IsNotEmpty } from "class-validator";
import { Admin } from "src/modules/admin/entity/admin.entity";
import { Attraction } from "src/modules/attractions/entity/attraction.entity";
import { User } from "src/modules/users/entity/user.entity";
import { BeforeInsert, Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CityExperience } from "src/modules/experiences/entity/city-experience.entity";

@Entity({ name: "cities" })
export class City {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: false })
    description: string;

    @Column({ nullable: false })
    image: string;

    @Column()
    created_by: number;

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

    @OneToMany(() => Attraction, (attraction) => attraction.city)
    attractions: Attraction[];

    @OneToMany(() => CityExperience, (cityExperience) => cityExperience.city)
    cityExperiences: CityExperience[];
}