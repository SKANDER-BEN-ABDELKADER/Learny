import { DatabaseService } from './../database/database.service';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';


@Injectable()
export class CourseService {
    constructor(private readonly databaseService: DatabaseService) {}

    //Create
  async create(createCourseDto: Prisma.CourseCreateInput) {
    try {
      return this.databaseService.course.create({
        data: createCourseDto
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Course already exists');
        }
        if (error.code === 'P2003') {
          throw new NotFoundException('Instructor not found');
        }
      }
      throw error;
    }
  }

  // Find all
  async findAll(filter?: {
    page?: number;
    limit?: number;
    category?: string;
    level?: string;
    priceMin?: number;
    priceMax?: number;
    search?: string;
    instructor?: string;
  }) {
    const {
      page = 1,
      limit = 3,
      category,
      level,
      priceMin,
      priceMax,
      search,
      instructor
    } = filter || {};
    const where: any = {};
    if (category) where.category = category;
    if (level) where.level = level;
    if (priceMin !== undefined || priceMax !== undefined) {
      where.price = {};
      if (priceMin !== undefined) where.price.gte = priceMin;
      if (priceMax !== undefined) where.price.lte = priceMax;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (instructor) {
      where.instructor = {
        OR: [
          { firstName: { contains: instructor, mode: 'insensitive' } },
          { lastName: { contains: instructor, mode: 'insensitive' } }
        ]
      };
    }
    const skip = (page - 1) * limit;
    const [coursesRaw, total] = await Promise.all([
      this.databaseService.course.findMany({
        include: {
          instructor: {
            select: {
              firstName: true,
              lastName: true,
            }
          },
          ratings: {
            select: { value: true },
          },
        },
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.databaseService.course.count({ where })
    ]);

    const courses = coursesRaw.map((course) => {
      const ratingValues = (course as any).ratings?.map((r: { value: number }) => r.value) || [];
      const ratingCount = ratingValues.length;
      const rating = ratingCount > 0 ? Number((ratingValues.reduce((a, b) => a + b, 0) / ratingCount).toFixed(1)) : 0;
      const { ratings, ...rest } = course as any;
      return { ...rest, rating, ratingCount };
    });

    return {
      data: courses,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit)
      
      
    };
  }

  // Find one
  async findOne(id: number) {
    const course = await this.databaseService.course.findUnique({
      include: {
        instructor: {
          select: {
            firstName: true,
            lastName: true,
            profilePicUrl: true,
            coursesCreated: {
              select: {
                students: {
                  select: {
                    id: true
                  }
                }
              }
            }
          }
        },
        students: {
          select: {
            id: true
          }
        },
        ratings: {
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true,
                profilePicUrl: true,
              }
            }
          }
        }
      },
      where: {
        id,
      }
    });

    if (!course) return null;

    const ratingValues = (course as any).ratings?.map((r: any) => r.value) || [];
    const ratingCount = ratingValues.length;
    const rating = ratingCount > 0 ? Number((ratingValues.reduce((a: number, b: number) => a + b, 0) / ratingCount).toFixed(1)) : 0;

    const reviews = ((course as any).ratings || []).map((r: any) => ({
      id: r.id,
      user: `${r.student?.firstName ?? ''} ${r.student?.lastName ?? ''}`.trim(),
      avatar: r.student?.profilePicUrl ?? undefined,
      date: r.createdAt?.toISOString?.() ?? r.createdAt,
      rating: r.value,
      content: '',
    }));

    const { ratings, ...rest } = course as any;
    
    // Calculate total students across all instructor's courses
    const allStudents = new Set();
    rest.instructor?.coursesCreated?.forEach((course: any) => {
      course.students?.forEach((student: any) => {
        allStudents.add(student.id);
      });
    });
    
    // Add course count and student count to instructor data
    const instructorWithCounts = {
      ...rest.instructor,
      courses: rest.instructor?.coursesCreated?.length || 0,
      students: allStudents.size
    };
    
    const studentsCount = Array.isArray(rest.students) ? rest.students.length : 0;

    return { 
      ...rest, 
      instructor: instructorWithCounts,
      studentsCount,
      rating, 
      ratingCount, 
      reviews 
    };
  }

  async findEnrolledByStudent(studentId: number) {
    const coursesRaw = await this.databaseService.course.findMany({
      where: {
        students: {
          some: { id: studentId }
        }
      },
      include: {
        instructor: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        ratings: {
          select: { value: true },
        },
      },
      orderBy: { id: 'desc' },
    });

    return coursesRaw.map((course) => {
      const ratingValues = (course as any).ratings?.map((r: { value: number }) => r.value) || [];
      const ratingCount = ratingValues.length;
      const rating = ratingCount > 0 ? Number((ratingValues.reduce((a, b) => a + b, 0) / ratingCount).toFixed(1)) : 0;
      const { ratings, ...rest } = course as any;
      return { ...rest, rating, ratingCount };
    });
  }

  async enrollStudentInCourse(courseId: number, studentId: number) {
    // Check if already enrolled
    const already = await this.databaseService.course.findFirst({
      where: {
        id: courseId,
        students: {
          some: { id: studentId }
        }
      },
      select: { id: true }
    });
    if (already) {
      return this.findOne(courseId);
    }

    await this.databaseService.course.update({
      where: { id: courseId },
      data: {
        students: {
          connect: { id: studentId }
        }
      }
    });

    return this.findOne(courseId);
  }

  // Update
  async update(id: number, updateCourseDto: Prisma.CourseUpdateInput) {
    return this.databaseService.course.update({
      where: {
        id,
      },
      data: updateCourseDto
    })
  }

  // Remove 
  async remove(id: number) {
    return this.databaseService.course.delete({
      where:{
        id,
      }
    })
  }

  // Find by instructor
  async findByInstructor(instructorId: number) {
    return this.databaseService.course.findMany({
      where: { instructorId },
    });
  }
}
