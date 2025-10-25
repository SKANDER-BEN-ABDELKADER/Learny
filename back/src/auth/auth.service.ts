import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });
    
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) return null;

    const { password, ...result } = user;
    return result;
  }

  async login(user: Omit<User, 'password'>) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        actual_role: user.actual_role,
        phone_number : user.phoneNumber,
        domain: user.domain,
        experience_lvl: user.experienceLvl

      }
    };
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }) {
    if (!userData.password) {
      throw new BadRequestException('Password is required');
    }

    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      return await this.databaseService.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber,
          role: 'STUDENT', 
          actual_role: 'STUDENT',

        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          actual_role: true,
          domain: true,
          experienceLvl: true,
          role: true,
          createdAt: true
        }
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          const target = e.meta?.target;
          if (Array.isArray(target)) {
            if (target.includes('email')) {
              throw new ConflictException('Email already exists');
            }
            if (target.includes('phoneNumber')) {
              throw new ConflictException('Phone number already exists');
            }
          }
        }
      }
      throw e;
    }
  }
}