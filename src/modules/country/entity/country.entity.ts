import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert } from "typeorm";
import { City } from "src/modules/city/entity/city.entity";

@Entity({ name: "countries" })
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  image: string;

  @Column({ type: 'smallint', default: 1 })
  status: number;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @BeforeInsert()
  setTimestamp() {
    this.timestamp = new Date();
  }

  @OneToMany(() => City, (city) => city.country)
  city: City;
}
