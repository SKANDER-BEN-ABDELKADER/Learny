import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  // @Roles('ADMIN')
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.userService.create(createUserDto);
  }

  @Get()
  // @Roles('ADMIN')
  findAll(@Query('role') role?: 'STUDENT' | 'INSTRUCTOR') {
    return this.userService.findAll(role);
  }

  @Get(':id')
  // @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('profilePic', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        callback(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
      },
    }),
  }))
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: Prisma.UserUpdateInput,
    @UploadedFile() profilePic?: Express.Multer.File
  ) {
    return this.userService.update(+id, updateUserDto, profilePic);
  }

  @Patch(':id/toggle-role')
  // @Roles('ADMIN')
  @HttpCode(200) // No content response
  async updateActualRole(@Param('id') id: string) {
    return this.userService.toggleActualRole(+id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
