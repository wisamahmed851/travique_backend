import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from 'src/modules/users/entity/user.entity';
import { Role } from 'src/modules/roles/entity/roles.entity';
import { UserRole } from 'src/modules/assig-roles-user/entity/user-role.entity';

@Injectable()
export class UserAuthSeederService {
  private readonly logger = new Logger(UserAuthSeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,

    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
  ) {}

  async seed(): Promise<void> {
    // // Delete old users by email if they exist
    // await this.deleteUserWithRoles('customer@gmail.com');
    // await this.deleteUserWithRoles('driver@gmail.com');
    // Re-insert both users
    await this.seedUser({
      name: 'Customer User',
      email: 'user@gmail.com',
      password: '123456789',   
      roleName: 'user',
    });

    
  }

  private async deleteUserWithRoles(email: string): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['userRoles'],
    });

    if (!user) return;

    if (user.userRoles && user.userRoles.length > 0) {
      await this.userRoleRepo.remove(user.userRoles);
    }

    await this.userRepo.remove(user);
    this.logger.log(`Deleted existing user: ${email}`);
  }

  private async seedUser({
    name,
    email,
    password,
    roleName,
  }: {
    name: string;
    email: string;
    password: string;
    roleName: string;
  }) {
    const existing = await this.userRepo.findOne({where: {email: email}});
    if(existing){
      // console.log("user already creates");
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepo.create({
      name,
      email,
      password: hashedPassword,
    });
    const savedUser = await this.userRepo.save(newUser);

    const role = await this.roleRepo.findOne({
      where: { name: roleName },
      select: {
        id: true,
        name: true,
      },
    });

    if (!role) {
      this.logger.error(`Role '${roleName}' not found in roles table.`);
      return;
    }

    const userRole = this.userRoleRepo.create({
      user: savedUser,
      role: role,
    });

    await this.userRoleRepo.save(userRole);

    this.logger.log(`User ${email} created with role ${role.name}`);
  }

  /* private async seedlocations({

  }) */
}
