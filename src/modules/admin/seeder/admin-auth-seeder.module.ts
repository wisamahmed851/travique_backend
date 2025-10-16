import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAuthSeederService } from './admin-auth-seeder.service';
import { Admin } from '../entity/admin.entity';
import { AdminRole } from 'src/modules/assig-roles-admin/entity/admin-role.entity';
import { Role } from 'src/modules/roles/entity/roles.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Admin, Role, AdminRole])],
  providers: [AdminAuthSeederService],
  exports: [AdminAuthSeederService], // Export to use in AppModule
})
export class AdminAuthSeederModule {
  constructor(
    private readonly adminAuthSeederService: AdminAuthSeederService,
  ) {}

  async onApplicationBootstrap() {
    await this.adminAuthSeederService.seed();
  }
}
