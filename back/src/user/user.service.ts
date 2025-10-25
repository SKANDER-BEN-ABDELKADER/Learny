import { DatabaseService } from './../database/database.service';
import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: Prisma.UserCreateInput) {
    return this.databaseService.user.create({
      data: createUserDto,
    })
  }

async findAll(role?: 'STUDENT' | 'INSTRUCTOR') {
  if (role) return this.databaseService.user.findMany({
    where: {
      role: role as Role,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      domain: true,
      experienceLvl: true,
      profilePicUrl: true,
      createdAt: true,
      coursesCreated: {
        select: { id: true }
      },
      coursesEnrolled: {
        select: { id: true }
      },
    }
  }) 
  return this.databaseService.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      domain: true,
      experienceLvl: true,
      profilePicUrl: true,
      createdAt: true,
      coursesCreated: {
        select: { id: true }
      },
      coursesEnrolled: {
        select: { id: true }
      },
    }
  })
}

  async findOne(id: number) {
    return this.databaseService.user.findUnique({
      where: {
        id,
      }
    })
  }

  async update(id: number, updateUserDto: Prisma.UserUpdateInput, profilePic?: Express.Multer.File) {
    const data: any = { ...updateUserDto };
    if (profilePic) {
      data.profilePicUrl = `/uploads/${profilePic.filename}`;
    }
    return this.databaseService.user.update({
      where: { id },
      data,
    });
  }

async toggleActualRole(id: number) {
  // First, get the current user to check their current role
  const user = await this.databaseService.user.findUnique({
    where: { id },
    select: { actual_role: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Determine the new role by toggling the current one
  const newRole = user.actual_role === Role.STUDENT ? Role.INSTRUCTOR : Role.STUDENT;

  // Update the user with the new role
  return this.databaseService.user.update({
    where: { id },
    data: { actual_role: newRole }
  });
}

  async remove(id: number) {
    return this.databaseService.user.delete({
      where: {
        id,
      }
    })
  }
}
