import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from "typeorm";
import { Experience } from "./experience.entity";
import { City } from "src/modules/city/entity/city.entity";

@Entity({ name: "city_experiences" })
export class CityExperience {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    city_id: number;

    @ManyToOne(() => City, (city) => city.cityExperiences, { onDelete: "CASCADE" })
    @JoinColumn({ name: "city_id" })
    city: City;

    @Column({ nullable: false })
    experience_id: number;

    @ManyToOne(() => Experience, (experience) => experience.cityExperiences, { onDelete: "CASCADE" })
    @JoinColumn({ name: "experience_id" })
    experience: Experience;
}
