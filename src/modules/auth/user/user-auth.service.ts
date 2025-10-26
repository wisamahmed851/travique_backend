import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/modules/users/entity/user.entity';
import { Role } from 'src/modules/roles/entity/roles.entity';
import { UserRole } from 'src/modules/assig-roles-user/entity/user-role.entity';
import { UpdateProfileDto, UserRegisterDto } from './dtos/user-auth.dto';
import { sanitizeUser } from 'src/common/utils/sanitize.util';
import { City } from 'src/modules/city/entity/city.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserAuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepo: Repository<UserRole>,
    @InjectRepository(City)
    private cityRepo: Repository<City>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) { }

  private handleUnknown(err: unknown): never {
    if (
      err instanceof BadRequestException ||
      err instanceof NotFoundException
    ) {
      throw err;
    }
    throw new InternalServerErrorException('Unexpected error occurred', {
      cause: err as Error,
    });
  }

  async register(body: UserRegisterDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1️⃣ Check if user already exists
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { email: body.email },
      });
      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      // 2️⃣ Hash password
      if (body.password) {
        body.password = await bcrypt.hash(body.password, 10);
      }

      // 3️⃣ Validate city (if provided)
      if (body.city_id) {
        const city = await queryRunner.manager.findOne(City, {
          where: { id: body.city_id },
        });
        if (!city) throw new NotFoundException('City not found');
      }

      // 4️⃣ Create user
      const user = queryRunner.manager.getRepository(User).create({
        name: body.name,
        email: body.email,
        password: body.password,
        phone: body.phone,
        gender: body.gender,
        city_id: body.city_id,
      });
      const savedUser = await queryRunner.manager.save(User, user);

      // 5️⃣ Assign default role if not provided
      if (!body.role) body.role = 'user';

      let role = await queryRunner.manager.findOne(Role, {
        where: { name: body.role },
        select: { id: true, name: true },
      });

      if (!role) throw new BadRequestException('Role Not Found');

      const userRole = queryRunner.manager.getRepository(UserRole).create({
        user_id: savedUser.id,
        role_id: role.id,
      });
      await queryRunner.manager.save(UserRole, userRole);

      await queryRunner.commitTransaction();

      // 6️⃣ Fetch user with role for response
      const userWithRole = await this.userRepository.findOne({
        where: { id: savedUser.id },
        relations: ['userRoles', 'userRoles.role'],
      });
      if (!userWithRole) {
        throw new NotFoundException("awl");
      }
      // 7️⃣ Automatically generate JWT token
      const payload = { id: userWithRole.id, email: userWithRole.email, role: role.name };
      const token = await this.jwtService.signAsync(payload);

      // ✅ Return both user info + token
      return { userWithRole, access_token: token, };

  } catch(err) {
    if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
    this.handleUnknown(err);
  } finally {
    await queryRunner.release();
  }
  }


  async validateUser(email: string, password: string) {
  try {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
    });
    if (!user) throw new BadRequestException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new BadRequestException('Invalid password');

    return user;
  } catch (err) {
    this.handleUnknown(err);
  }
}

  async login(user: User) {
  try {
    const roles = await this.userRoleRepo.find({
      where: { user_id: user.id },
      relations: ['role'],
    });
    const roleNames = roles.map((r) => r.role.name);
    const payload = { sub: user.id, email: user.email, roles: roleNames };

    const token = this.jwtService.sign(payload, { expiresIn: '30m' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    user.access_token = token;
    user.refresh_token = refresh_token;
    await this.userRepository.save(user);

    const role = roles[0]?.role;
    return { user, token, refresh_token, role };
  } catch (err) {
    this.handleUnknown(err);
  }
}

  async currentLocation(userId: number, body: { langitude: number; latitude: number }) {
  try {
    const result = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        longitude: () => `${body.langitude}`,
        latitude: () => `${body.latitude}`,
      })
      .where('id = :id', { id: userId })
      .returning(['id', 'name', 'email', 'phone', 'address', 'longitude', 'latitude'])
      .execute();

    if (!result.affected) throw new NotFoundException('User not found');
    return result.raw[0];
  } catch (err) {
    this.handleUnknown(err);
  }
}

  async refreshToken(refreshToken: string) {
  const user = await this.userRepository.findOne({ where: { refresh_token: refreshToken } });
  if (!user) throw new UnauthorizedException('Invalid refresh token');

  try {
    const roles = await this.userRoleRepo.find({ where: { user_id: user.id }, relations: ['role'] });
    const roleNames = roles.map((r) => r.role.name);
    const payload = this.jwtService.verify(refreshToken, { secret: 'user-secret-key' });

    const newAccessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, roles: roleNames },
      { expiresIn: '30m' },
    );

    user.access_token = newAccessToken;
    await this.userRepository.save(user);

    return { access_token: newAccessToken, user: sanitizeUser(user) };
  } catch (err) {
    this.handleUnknown(err);
  }
}

  async profile(user: User) {
  try {
    const found = await this.userRepository.findOne({
      where: { id: user.id },
      select: ['id', 'name', 'email', 'phone', 'address', 'gender', 'street', 'district', 'image', 'status', 'created_at', 'updated_at'],
    });
    if (!found) throw new NotFoundException('User not found');
    return found;
  } catch (err) {
    this.handleUnknown(err);
  }
}

  async profileUpdate(user: User, body: UpdateProfileDto) {
  try {
    const exist = await this.userRepository.findOne({ where: { id: user.id } });
    if (!exist) throw new NotFoundException('User Not Found');

    Object.assign(exist, body);
    return await this.userRepository.save(exist);
  } catch (err) {
    this.handleUnknown(err);
  }
}

  async changePassword(body: { oldPassword: string; newPassword: string }, user: User) {
  try {
    const loginUser = await this.userRepository.findOne({ where: { id: user.id } });
    if (!loginUser) throw new NotFoundException('User not found');

    const matched = await bcrypt.compare(body.oldPassword, loginUser.password);
    if (!matched) throw new BadRequestException('Old password is incorrect');

    loginUser.password = await bcrypt.hash(body.newPassword.trim(), 10);
    await this.userRepository.save(loginUser);
    return true;
  } catch (err) {
    this.handleUnknown(err);
  }
}

  async modeChange(user: User) {
  try {
    const currentUser = await this.userRepository.findOne({ where: { id: user.id } });
    if (!currentUser) throw new NotFoundException('Driver not Found');

    currentUser.isOnline = currentUser.isOnline === 1 ? 0 : 1;
    const saved = await this.userRepository.save(currentUser);
    return saved;
  } catch (err) {
    this.handleUnknown(err);
  }
}

  async logout(user: User) {
  try {
    const exist = await this.userRepository.findOne({ where: { id: user.id } });
    if (!exist) throw new NotFoundException('User not found');

    exist.access_token = '';
    await this.userRepository.save(exist);
    return true;
  } catch (err) {
    this.handleUnknown(err);
  }
}
}
