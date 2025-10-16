import { Module } from '@nestjs/common';
import { UserAuthService } from './user-auth.service';
import { UserAuthController } from './user-auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entity/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserJwtStrategy } from './user-jwt.strategy';
import { Role } from 'src/modules/roles/entity/roles.entity';
import { UserRole } from 'src/modules/assig-roles-user/entity/user-role.entity';
import { City } from 'src/modules/city/entity/city.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, UserRole, City]), // ✅ THIS LINE IS REQUIRED
    JwtModule.register({
      secret: 'user-secret-key',
      signOptions: { expiresIn: '30m' },
    }),
  ],
  controllers: [UserAuthController],
  providers: [UserAuthService, UserJwtStrategy],
  exports: [UserAuthService],
})
export class UserAuthModule { }
