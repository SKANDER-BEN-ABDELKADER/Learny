import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { DatabaseService } from '../database/database.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { DefaultArgs, GetFindResult, Record } from '@prisma/client/runtime/library';

describe('AuthService', () => {
  let service: AuthService;
  let databaseService: jest.Mocked<Partial<DatabaseService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  beforeEach(async () => {
    databaseService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findUniqueOrThrow: function <T extends Prisma.UserFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, Prisma.UserFindUniqueOrThrowArgs<DefaultArgs>>): Prisma.Prisma__UserClient<GetFindResult<Prisma.$UserPayload<DefaultArgs>, T, Prisma.PrismaClientOptions>, never, DefaultArgs, Prisma.PrismaClientOptions> {
          throw new Error('Function not implemented.');
        },
        findFirst: function <T extends Prisma.UserFindFirstArgs>(args?: Prisma.SelectSubset<T, Prisma.UserFindFirstArgs<DefaultArgs>> | undefined): Prisma.Prisma__UserClient<GetFindResult<Prisma.$UserPayload<DefaultArgs>, T, Prisma.PrismaClientOptions> | null, null, DefaultArgs, Prisma.PrismaClientOptions> {
          throw new Error('Function not implemented.');
        },
        findFirstOrThrow: function <T extends Prisma.UserFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, Prisma.UserFindFirstOrThrowArgs<DefaultArgs>> | undefined): Prisma.Prisma__UserClient<GetFindResult<Prisma.$UserPayload<DefaultArgs>, T, Prisma.PrismaClientOptions>, never, DefaultArgs, Prisma.PrismaClientOptions> {
          throw new Error('Function not implemented.');
        },
        findMany: function <T extends Prisma.UserFindManyArgs>(args?: Prisma.SelectSubset<T, Prisma.UserFindManyArgs<DefaultArgs>> | undefined): Prisma.PrismaPromise<GetFindResult<Prisma.$UserPayload<DefaultArgs>, T, Prisma.PrismaClientOptions>[]> {
          throw new Error('Function not implemented.');
        },
        createMany: function <T extends Prisma.UserCreateManyArgs>(args?: Prisma.SelectSubset<T, Prisma.UserCreateManyArgs<DefaultArgs>> | undefined): Prisma.PrismaPromise<Prisma.BatchPayload> {
          throw new Error('Function not implemented.');
        },
        createManyAndReturn: function <T extends Prisma.UserCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, Prisma.UserCreateManyAndReturnArgs<DefaultArgs>> | undefined): Prisma.PrismaPromise<GetFindResult<Prisma.$UserPayload<DefaultArgs>, T, Prisma.PrismaClientOptions>[]> {
          throw new Error('Function not implemented.');
        },
        delete: function <T extends Prisma.UserDeleteArgs>(args: Prisma.SelectSubset<T, Prisma.UserDeleteArgs<DefaultArgs>>): Prisma.Prisma__UserClient<GetFindResult<Prisma.$UserPayload<DefaultArgs>, T, Prisma.PrismaClientOptions>, never, DefaultArgs, Prisma.PrismaClientOptions> {
          throw new Error('Function not implemented.');
        },
        update: function <T extends Prisma.UserUpdateArgs>(args: Prisma.SelectSubset<T, Prisma.UserUpdateArgs<DefaultArgs>>): Prisma.Prisma__UserClient<GetFindResult<Prisma.$UserPayload<DefaultArgs>, T, Prisma.PrismaClientOptions>, never, DefaultArgs, Prisma.PrismaClientOptions> {
          throw new Error('Function not implemented.');
        },
        deleteMany: function <T extends Prisma.UserDeleteManyArgs>(args?: Prisma.SelectSubset<T, Prisma.UserDeleteManyArgs<DefaultArgs>> | undefined): Prisma.PrismaPromise<Prisma.BatchPayload> {
          throw new Error('Function not implemented.');
        },
        updateMany: function <T extends Prisma.UserUpdateManyArgs>(args: Prisma.SelectSubset<T, Prisma.UserUpdateManyArgs<DefaultArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload> {
          throw new Error('Function not implemented.');
        },
        updateManyAndReturn: function <T extends Prisma.UserUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, Prisma.UserUpdateManyAndReturnArgs<DefaultArgs>>): Prisma.PrismaPromise<GetFindResult<Prisma.$UserPayload<DefaultArgs>, T, Prisma.PrismaClientOptions>[]> {
          throw new Error('Function not implemented.');
        },
        upsert: function <T extends Prisma.UserUpsertArgs>(args: Prisma.SelectSubset<T, Prisma.UserUpsertArgs<DefaultArgs>>): Prisma.Prisma__UserClient<GetFindResult<Prisma.$UserPayload<DefaultArgs>, T, Prisma.PrismaClientOptions>, never, DefaultArgs, Prisma.PrismaClientOptions> {
          throw new Error('Function not implemented.');
        },
        count: function <T extends Prisma.UserCountArgs>(args?: Prisma.Subset<T, Prisma.UserCountArgs>): Prisma.PrismaPromise<T extends Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], Prisma.UserCountAggregateOutputType> : number> {
          throw new Error('Function not implemented.');
        },
        aggregate: function <T extends Prisma.UserAggregateArgs>(args: Prisma.Subset<T, Prisma.UserAggregateArgs>): Prisma.PrismaPromise<Prisma.GetUserAggregateType<T>> {
          throw new Error('Function not implemented.');
        },
        groupBy: jest.fn(),
        fields: {} as any
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DatabaseService, useValue: databaseService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should return user without password when validation succeeds', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password', 10),
        firstName: 'Test',
        lastName: 'User'
      };

      (databaseService.user as any).findUnique = jest.fn().mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      });
    });

    it('should return null when user not found', async () => {
      (databaseService.user as any).findUnique = jest.fn().mockResolvedValue(null);
      const result = await service.validateUser('nonexistent@example.com', 'password');
      expect(result).toBeNull();
    });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'password',
        firstName: 'New',
        lastName: 'User',
    
      };

      (databaseService.user as any).create = jest.fn().mockResolvedValue({
        id: 2,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        createdAt: new Date()
      });

      const result = await service.register(userData);
      expect(result).toBeDefined();
      expect((databaseService.user as any).create).toHaveBeenCalled();
    });
  });
});
});