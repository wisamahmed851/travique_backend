import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from './modules/users/users.module';
import { UserAuthModule } from './modules/auth/user/user-auth.module';
import { RolesModule } from './modules/roles/roles.module';
import { RolesSeederModule } from './modules/roles/seeder/roles-seeder.module';
import { AdminsModule } from './modules/admin/admin.module';
import { AdminAuthModule } from './modules/auth/admin/admin-auth.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolePermissionModule } from './modules/role-permissions/role-permissions.module';
import { AdminRoleModule } from './modules/assig-roles-admin/admin-roles.module';
import { UserRoleModule } from './modules/assig-roles-user/user-roles.module';
import { UserPermissionModule } from './modules/assign-permission-user/user-permission.module';
import { AdminPermissionModule } from './modules/assign-permission-admin/admin-permission.module';
import { UserAuthSeederModule } from './modules/auth/user/seeder/user-auth-seeder.module';
import { AdminAuthSeederModule } from './modules/admin/seeder/admin-auth-seeder.module';
import { CityModule } from './modules/city/city.module';
import { AdminAuthSeederService } from './modules/admin/seeder/admin-auth-seeder.service';
import { AttractionModule } from './modules/attractions/attraction.module';
import { ReviewModule } from './modules/review/review.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: 'postgres',
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    UsersModule,
    UserAuthModule,
    RolesModule,
    RolesSeederModule,
    AdminsModule,
    AdminAuthModule,
    PermissionsModule,
    RolePermissionModule,
    AdminRoleModule,
    UserRoleModule,
    UserPermissionModule,
    AdminPermissionModule,
    UserAuthSeederModule,
    AdminAuthSeederModule,
    CityModule,
    AttractionModule,
    ReviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(
    private readonly adminAuthSeederService: AdminAuthSeederService,
  ) { }

  async onApplicationBootstrap() {
    await this.adminAuthSeederService.seed();
  }
}
