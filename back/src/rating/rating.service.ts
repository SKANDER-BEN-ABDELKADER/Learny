import { DatabaseService } from './../database/database.service';
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';


@Injectable()
export class RatingService {
    constructor(private readonly databaseService: DatabaseService) {}

  async create(createRatingDto: Prisma.RatingCreateInput) {
    return this.databaseService.rating.create({
      data: createRatingDto,
    })
  }

  async findAll() {
    return this.databaseService.rating.findMany()
  }

  async findOne(id: number) {
    return this.databaseService.rating.findUnique({
      where: {
        id,
      }
    })
  }

  async update(id: number, updateRatingDto: Prisma.RatingUpdateInput) {
    return this.databaseService.rating.update({
      where: {
        id,
      },
        data: updateRatingDto
    })
  }

  async remove(id: number) {
    return this.databaseService.rating.delete({
      where: {
        id, 
      }
    })
  }

  async createCourseRating(courseId: number, studentId: number, value: number) {
    // Check if student has already rated this course
    const existingRating = await this.databaseService.rating.findFirst({
      where: {
        courseId,
        studentId
      }
    });

    // Validate rating value (1-5)
    if (value < 1 || value > 5) {
      throw new ConflictException('Rating must be between 1 and 5');
    }

    if (existingRating) {
      // Update existing rating
      return this.databaseService.rating.update({
        where: {
          id: existingRating.id
        },
        data: {
          value,
          
        },
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true,
              profilePicUrl: true
            }
          }
        }
      });
    } else {
      // Create new rating
      return this.databaseService.rating.create({
        data: {
          value,
          courseId,
          studentId,
        },
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true,
              profilePicUrl: true
            }
          }
        }
      });
    }
  }

  async getCourseRatings(courseId: number) {
    return this.databaseService.rating.findMany({
      where: {
        courseId
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            profilePicUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getUserRatingForCourse(courseId: number, studentId: number) {
    return this.databaseService.rating.findFirst({
      where: {
        courseId,
        studentId
      }
    });
  }
}
