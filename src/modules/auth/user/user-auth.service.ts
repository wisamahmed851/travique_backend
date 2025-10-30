import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/modules/users/entity/user.entity';
import { Role } from 'src/modules/roles/entity/roles.entity';
import { UserRole } from 'src/modules/assig-roles-user/entity/user-role.entity';
import { UpdateProfileDto, UserRegisterDto } from './dtos/user-auth.dto';
import { sanitizeUser } from 'src/common/utils/sanitize.util';
import { City } from 'src/modules/city/entity/city.entity';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/common/mail/mail.service';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class UserAuthService {
  private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    private readonly mailSerivce: MailService,
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

  async googleLogin(token: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: '1065376512567-u7aolqk1c2esmhfccbuea09gonmbrso5.apps.googleusercontent.com',
      });

      const payload = ticket.getPayload();
      if (!payload) throw new BadRequestException("Token is invalid");

      const { email, name, picture } = payload;

      let user = await this.userRepository.findOne({ where: { email: email } });
      let message = "You are logged in successfuly";
      if (!user) {
        user = this.userRepository.create({
          name: name,
          email: email,
          image: picture,
          is_verified: true,
        });
        await this.userRepository.save(user);
        message = 'you are registered successfull';
      }

      const jwtPaylod = { id: user.id, email: user.email, role: 'user' };
      const access_token = this.jwtService.sign(jwtPaylod, { expiresIn: '30m' });
      const refresh_token = this.jwtService.sign(jwtPaylod, { expiresIn: '7d' });


      user.access_token = access_token;
      user.refresh_token = refresh_token;
      await this.userRepository.save(user);

      return { user, access_token, refresh_token, message }
    } catch (e) {
      this.handleUnknown(e);
    }
  }

  async register(body: UserRegisterDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if user already exists
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { email: body.email },
      });
      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }

      // Hash password
      if (body.password) {
        body.password = await bcrypt.hash(body.password, 10);
      }

      // Validate city (optional)
      if (body.city_id) {
        const city = await queryRunner.manager.findOne(City, {
          where: { id: body.city_id },
        });
        if (!city) throw new NotFoundException('City not found');
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // 5 min

      // Create user
      const user = queryRunner.manager.getRepository(User).create({
        name: body.name,
        email: body.email,
        password: body.password,
        phone: body.phone,
        gender: body.gender,
        city_id: body.city_id,
        is_verified: false,
        otp,
        otp_expiration: otpExpiration,
      });

      const savedUser = await queryRunner.manager.save(User, user);

      // Assign role
      if (!body.role) body.role = 'user';
      const role = await queryRunner.manager.findOne(Role, { where: { name: body.role } });
      if (!role) throw new BadRequestException('Role Not Found');

      const userRole = queryRunner.manager.getRepository(UserRole).create({
        user_id: savedUser.id,
        role_id: role.id,
      });
      await queryRunner.manager.save(UserRole, userRole);

      await queryRunner.commitTransaction();

      // Send OTP email
      await this.mailSerivce.sendVerificationEmail(savedUser.email, otp);

      return { message: 'OTP sent to your email. Please verify to activate your account.' };
    } catch (err) {
      if (queryRunner.isTransactionActive) await queryRunner.rollbackTransaction();
      this.handleUnknown(err);
    } finally {
      await queryRunner.release();
    }
  }

  async verifyOtp(email: string, otp: string) {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) throw new NotFoundException('User not found');
      if (user.is_verified) return { message: 'User already verified' };

      // Check if OTP is correct and not expired
      const now = new Date();
      if (user.otp !== otp) throw new BadRequestException('Invalid OTP');
      if (now > user.otp_expiration) throw new BadRequestException('OTP expired');

      // Mark user verified
      user.is_verified = true;
      user.otp = '';

      await this.userRepository.save(user);

      // Generate login token now that user is verified
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

      return { message: 'Account verified successfully', token, refresh_token, user };
    } catch (err) {
      this.handleUnknown(err);
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
      if (!user.is_verified) {
        // Generate and resend OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otp_expiration = new Date(Date.now() + 5 * 60 * 1000);
        await this.userRepository.save(user);
        await this.mailSerivce.sendVerificationEmail(user.email, otp);

        return { message: 'Account not verified. New OTP sent to your email.' };
      }

      // Fetch roles
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
      if (user.access_token) {
        let message = "User Logged in Successfull";
      }
      const mainUser = {
        id: user.id,
        name: user.name,
        email: user.email,
      }
      const role = roles[0]?.role;
      return {
        user: mainUser,
        token,
        refresh_token,
        role
      };
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
        select: ['id', 'name', 'email', 'phone', 'address', 'gender', 'image', 'status', 'created_at', 'updated_at'],
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
