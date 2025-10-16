import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Role } from '../roles/entity/roles.entity';
import { UserRole } from '../assig-roles-user/entity/user-role.entity';
import { City } from '../city/entity/city.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, UserRole, City])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
