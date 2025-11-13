import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AttractionCategory } from "./entity/attraction-category.entity";
import { AttractionCategoryService } from "./attraction-category.service";
import { AttractionCategoryController } from "./attraction-category.controller";

@Module({
  imports: [TypeOrmModule.forFeature([AttractionCategory])],
  controllers: [AttractionCategoryController],
  providers: [AttractionCategoryService],
  exports: [AttractionCategoryService],
})
export class AttractionCategoryModule {}
