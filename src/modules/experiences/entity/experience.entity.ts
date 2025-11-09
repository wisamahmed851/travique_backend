import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert } from "typeorm";
import { CityExperience } from "./city-experience.entity";

@Entity({ name: "experiences" })
export class Experience {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'smallint', default: 1 })
  status: number;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @BeforeInsert()
  setTimestamp() {
    this.timestamp = new Date();
  }

  @OneToMany(() => CityExperience, (cityExperience) => cityExperience.experience)
  cityExperiences: CityExperience[];
}
