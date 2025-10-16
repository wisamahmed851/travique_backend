import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entity/user.entity';
import { Role } from 'src/modules/roles/entity/roles.entity';
import { UserRole } from 'src/modules/assig-roles-user/entity/user-role.entity';
import { UserAuthSeederService } from './user-auth-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, UserRole])],
  providers: [UserAuthSeederService],
  exports: [UserAuthSeederService],
})
export class UserAuthSeederModule {
  constructor(private readonly userAuthSeederService: UserAuthSeederService) {}

  async onApplicationBootstrap() {
    await this.userAuthSeederService.seed(); 
  }
}
