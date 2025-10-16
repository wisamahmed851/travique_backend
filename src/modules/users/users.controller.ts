import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dtos/users.dto';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/common/utils/multer.config';
import { UserDetailsDto } from './dtos/user_details.dto';
import { User } from './entity/user.entity';
import { Request } from 'express';
import { AdminJwtAuthGuard } from '../auth/admin/admin-jwt.guard';
import { UserJwtAuthGuard } from '../auth/user/user-jwt.guard';

@Controller('admin/users')
@UseGuards(AdminJwtAuthGuard)
export class UsersController {
  constructor(private userService: UsersService) { }

  @Post('store')
  @UseInterceptors(FileInterceptor('image', multerConfig('uploads')))
  Store(
    @Body() user: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const image = file?.filename;
    return this.userService.storeUser({ ...user, image });
  }

  @Get('index')
  idnex() {
    return this.userService.idnex();
  }

  @Get('findOne/:id')
  findOne(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_ACCEPTABLE }),
    )
    id: number,
  ) {
    return this.userService.findOne(id);
  }

  @Post('findOnebyEmail')
  findOneByEmail(@Body() data: any) {
    console.log(data.email);
    return this.userService.findOnByEmail(data.email);
  }

  @HttpCode(200)
  @Post('update/:id')
  @UseInterceptors(FileInterceptor('image', multerConfig('uploads')))
  update(
    @Param('id') id: number,
    @Body() user: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const image = file?.filename;
    return this.userService.updateUser(id, { ...user, image });
  }

  @Get('toogleStatus/:id')
  statusChange(@Param('id', ParseIntPipe) id: number) {
    return this.userService.statusUpdate(id);
  }
}
