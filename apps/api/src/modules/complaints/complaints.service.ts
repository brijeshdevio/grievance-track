import { randomBytes } from 'node:crypto';

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@/constants/prisma.constant';

import { CreateComplaintDto } from './dto/create-complaint.dto';
import {
  CreateComplaintResponse,
  FindAllComplaintListResponse,
  FindOneComplaintDetailResponse,
  MarkComplaintInvalidResponse,
  RateComplaintResponse,
  UpdateComplaintStatusResponse,
} from './types/complains.type';
import { ComplaintStatus, Role } from '@/types/prisma.type';
import { FindAllComplaintQueryDto } from './dto/complaint-query.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { MarkComplaintInvalidDto } from './dto/mark-complaint-invalid.dto';
import { RateComplaintDto } from './dto/rate-complaint.dto';

@Injectable()
export class ComplaintsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    userId: string,
    dto: CreateComplaintDto,
  ): Promise<CreateComplaintResponse> {
    const category = await this.validateCategory(dto.categoryId);

    const citizen = await this.validateCitizen(userId);

    return this.createComplaint({
      userId,
      dto,
      category,
      citizen,
    });
  }

  async findAll(
    userId: string,
    role: Role,
    query: FindAllComplaintQueryDto,
  ): Promise<FindAllComplaintListResponse> {
    const { page, limit, status, categoryId, departmentId, search } = query;

    const where: Prisma.ComplaintWhereInput = {
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            complaintNumber: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    if (role === 'CITIZEN') {
      where.citizenId = userId;
    }

    if (role === 'DEPARTMENT') {
      const departmentUser = await this.prismaService.user.findFirst({
        where: {
          id: userId,
          role: 'DEPARTMENT',
          isActive: true,
        },
        select: {
          departmentId: true,
        },
      });

      if (!departmentUser?.departmentId) {
        throw new ForbiddenException('User is not assigned to a department');
      }

      where.departmentId = departmentUser.departmentId;
    }

    if (role === 'ADMIN' && departmentId) {
      where.departmentId = departmentId;
    }

    const [complaints, total] = await this.prismaService.$transaction([
      this.prismaService.complaint.findMany({
        where,
        select: {
          id: true,
          complaintNumber: true,
          title: true,
          location: true,
          status: true,
          photoUrl: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          department:
            role === Role.DEPARTMENT
              ? undefined
              : {
                  select: {
                    id: true,
                    name: true,
                  },
                },
          citizen:
            role === Role.CITIZEN
              ? undefined
              : {
                  select: {
                    id: true,
                    name: true,
                  },
                },
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prismaService.complaint.count({ where }),
    ]);

    return {
      data: complaints,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(
    code: string,
    userId: string,
    role: Role,
  ): Promise<FindOneComplaintDetailResponse> {
    const accessWhere: Prisma.ComplaintWhereInput = { complaintNumber: code };

    if (role === 'CITIZEN') {
      accessWhere.citizenId = userId;
    }

    if (role === 'DEPARTMENT') {
      const departmentUser = await this.prismaService.user.findFirst({
        where: {
          id: userId,
          role: 'DEPARTMENT',
          isActive: true,
        },
        select: {
          departmentId: true,
        },
      });

      if (!departmentUser?.departmentId) {
        throw new ForbiddenException('User is not assigned to a department');
      }

      accessWhere.departmentId = departmentUser.departmentId;
    }

    const complaint = await this.prismaService.complaint.findFirst({
      where: accessWhere,
      select: {
        id: true,
        complaintNumber: true,
        title: true,
        description: true,
        location: true,
        photoUrl: true,
        status: true,
        rating: true,
        ratingComment: true,
        closedAt: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        department:
          role === Role.DEPARTMENT
            ? undefined
            : {
                select: {
                  id: true,
                  name: true,
                },
              },
        citizen:
          role === Role.CITIZEN
            ? undefined
            : {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
        statusHistory: {
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            id: true,
            status: true,
            note: true,
            createdAt: true,
            changedBy: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
        comments: {
          orderBy: {
            createdAt: 'asc',
          },
          select: {
            id: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    return complaint;
  }

  async updateStatus(
    id: string,
    userId: string,
    role: Role,
    dto: UpdateComplaintStatusDto,
  ): Promise<UpdateComplaintStatusResponse> {
    const complaint = await this.prismaService.complaint.findUnique({
      where: { id },
      select: {
        id: true,
        complaintNumber: true,
        status: true,
        citizenId: true,
        departmentId: true,
        rating: true,
        citizen: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    if (role === 'DEPARTMENT') {
      const departmentUser = await this.prismaService.user.findFirst({
        where: {
          id: userId,
          role: 'DEPARTMENT',
          isActive: true,
        },
        select: {
          departmentId: true,
        },
      });

      if (!departmentUser?.departmentId) {
        throw new ForbiddenException('User is not assigned to a department');
      }

      if (complaint.departmentId !== departmentUser.departmentId) {
        throw new ForbiddenException(
          'You are not authorized to update this complaint',
        );
      }
    }

    const allowedTransitions: Record<ComplaintStatus, ComplaintStatus[]> = {
      SUBMITTED: ['UNDER_REVIEW'],
      UNDER_REVIEW: ['IN_PROGRESS'],
      IN_PROGRESS: ['RESOLVED'],
      RESOLVED: ['CLOSED'],
      CLOSED: [],
    };

    const nextStatuses = allowedTransitions[complaint.status];

    if (!nextStatuses.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot change complaint status from ${complaint.status} to ${dto.status}`,
      );
    }

    if (
      dto.status === 'CLOSED' &&
      complaint.status === 'RESOLVED' &&
      !complaint.rating &&
      role !== 'ADMIN'
    ) {
      throw new BadRequestException(
        'Complaint cannot be closed until the citizen rates it',
      );
    }

    const result = await this.prismaService.$transaction(async (tx) => {
      const updatedComplaint = await tx.complaint.update({
        where: {
          id: complaint.id,
        },
        data: {
          status: dto.status,
          ...(dto.status === 'CLOSED' && {
            closedAt: new Date(),
          }),
        },
        select: {
          id: true,
          complaintNumber: true,
          status: true,
          updatedAt: true,
        },
      });

      const statusHistory = await tx.complaintStatusHistory.create({
        data: {
          complaintId: complaint.id,
          status: dto.status,
          note: dto.note,
          changedById: userId,
        },
        select: {
          id: true,
          status: true,
          note: true,
          createdAt: true,
        },
      });

      await tx.notification.create({
        data: {
          title: 'Complaint Status Updated',
          message: `Your complaint ${complaint.complaintNumber} status has been updated to ${dto.status}.`,
          userId: complaint.citizenId,
          complaintId: complaint.id,
        },
      });

      return {
        ...updatedComplaint,
        statusHistory,
      };
    });

    // TODO: Send status-change email to the citizen.
    // TODO: If status is RESOLVED, send a rating-request email to the citizen.

    return result;
  }

  async markInvalid(
    id: string,
    userId: string,
    role: Role,
    dto: MarkComplaintInvalidDto,
  ): Promise<MarkComplaintInvalidResponse> {
    const complaint = await this.prismaService.complaint.findUnique({
      where: { id },
      select: {
        id: true,
        complaintNumber: true,
        status: true,
        departmentId: true,
        citizenId: true,
      },
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    if (complaint.status === 'CLOSED') {
      throw new BadRequestException('Complaint is already closed');
    }

    if (role === 'DEPARTMENT') {
      const departmentUser = await this.prismaService.user.findFirst({
        where: {
          id: userId,
          role: 'DEPARTMENT',
          isActive: true,
        },
        select: {
          departmentId: true,
        },
      });

      if (!departmentUser?.departmentId) {
        throw new ForbiddenException('User is not assigned to a department');
      }

      if (complaint.departmentId !== departmentUser.departmentId) {
        throw new ForbiddenException(
          'You are not authorized to update this complaint',
        );
      }
    }

    const closedAt = new Date();

    const result = await this.prismaService.$transaction(async (tx) => {
      const updatedComplaint = await tx.complaint.update({
        where: {
          id: complaint.id,
        },
        data: {
          status: 'CLOSED',
          closedAt,
        },
        select: {
          id: true,
          complaintNumber: true,
          status: true,
          closedAt: true,
        },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaintId: complaint.id,
          status: 'CLOSED',
          note: dto.reason,
          changedById: userId,
        },
      });

      await tx.notification.create({
        data: {
          title: 'Complaint Marked as Invalid',
          message: `Your complaint ${complaint.complaintNumber} has been marked as invalid. Reason: ${dto.reason}`,
          userId: complaint.citizenId,
          complaintId: complaint.id,
        },
      });

      return updatedComplaint;
    });

    // TODO: Send invalid-complaint notification email to the citizen.

    return result;
  }

  async rate(
    id: string,
    userId: string,
    dto: RateComplaintDto,
  ): Promise<RateComplaintResponse> {
    const complaint = await this.prismaService.complaint.findUnique({
      where: { id },
      select: {
        id: true,
        complaintNumber: true,
        citizenId: true,
        departmentId: true,
        status: true,
        rating: true,
      },
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    if (complaint.citizenId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to rate this complaint',
      );
    }

    if (complaint.status !== 'RESOLVED') {
      throw new BadRequestException('Only resolved complaints can be rated');
    }

    if (complaint.rating !== null) {
      throw new BadRequestException('This complaint has already been rated');
    }

    const closedAt = new Date();

    const result = await this.prismaService.$transaction(async (tx) => {
      const updatedComplaint = await tx.complaint.update({
        where: {
          id: complaint.id,
        },
        data: {
          rating: dto.rating,
          ratingComment: dto.ratingComment,
          status: 'CLOSED',
          closedAt,
        },
        select: {
          id: true,
          complaintNumber: true,
          rating: true,
          ratingComment: true,
          status: true,
          closedAt: true,
        },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaintId: complaint.id,
          status: 'CLOSED',
          note: 'Complaint closed after citizen feedback',
          changedById: userId,
        },
      });

      const departmentUsers = await tx.user.findMany({
        where: {
          departmentId: complaint.departmentId,
          role: 'DEPARTMENT',
          isActive: true,
        },
        select: {
          id: true,
        },
      });

      if (departmentUsers.length > 0) {
        await tx.notification.createMany({
          data: departmentUsers.map((user) => ({
            title: 'Complaint Rated',
            message: `Complaint ${complaint.complaintNumber} has been rated ${dto.rating}/5 by the citizen.`,
            userId: user.id,
            complaintId: complaint.id,
          })),
        });
      }

      return updatedComplaint;
    });

    return result;
  }

  private generateComplaintNumber() {
    return `GRV-${new Date().getFullYear()}-${randomBytes(4)
      .toString('hex')
      .toUpperCase()}`;
  }

  private async validateCategory(categoryId: string) {
    const category = await this.prismaService.category.findFirst({
      where: {
        id: categoryId,
        isActive: true,
        department: {
          isActive: true,
        },
      },
      select: {
        id: true,
        name: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
            users: {
              where: {
                isActive: true,
              },
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found or inactive');
    }

    return category;
  }

  private async validateCitizen(userId: string) {
    const citizen = await this.prismaService.user.findFirst({
      where: {
        id: userId,
        role: 'CITIZEN',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!citizen) {
      throw new ForbiddenException(
        'Only active citizens can submit complaints',
      );
    }

    return citizen;
  }

  private async createComplaint(params: {
    userId: string;
    dto: CreateComplaintDto;
    category: Awaited<ReturnType<typeof this.validateCategory>>;
    citizen: Awaited<ReturnType<typeof this.validateCitizen>>;
    photoUrl?: string;
  }): Promise<CreateComplaintResponse> {
    const { userId, dto, category, photoUrl } = params;

    const complaintNumber = this.generateComplaintNumber();

    return this.prismaService.$transaction(async (tx) => {
      const complaint = await tx.complaint.create({
        data: {
          complaintNumber,
          title: dto.title,
          description: dto.description,
          location: dto.location,
          photoUrl,
          status: 'SUBMITTED',
          citizenId: userId,
          categoryId: category.id,
          departmentId: category.departmentId,
        },
        select: {
          id: true,
          complaintNumber: true,
          title: true,
          status: true,
          createdAt: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      await this.createStatusHistory(tx, complaint.id, userId);

      return complaint;
    });
  }

  private async createStatusHistory(
    tx: Prisma.TransactionClient,
    complaintId: string,
    userId: string,
  ) {
    await tx.complaintStatusHistory.create({
      data: {
        complaintId,
        status: 'SUBMITTED',
        changedById: userId,
      },
    });
  }
}
