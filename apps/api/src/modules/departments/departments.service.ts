import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { hashPassword } from '@/common/helpers';
import { ComplaintStatus, Role } from '@/types/prisma.type';
import { PrismaService } from '@/prisma/prisma.service';

import { CreateDepartmentDto } from './dto/create-department.dto';
import {
  CreateDepartmentResponse,
  FindAllDepartmentListResponse,
  FindOneDepartmentDetailResponse,
  PublicDepartmentResponse,
  UpdateDepartmentResponse,
} from './types/departments.type';
import { FindAllDepartmentsDto } from './dto/department-query.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateDepartmentDto): Promise<CreateDepartmentResponse> {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: dto.account.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await hashPassword(dto.account.password);

    const department = await this.prismaService.$transaction(async (tx) => {
      const createdDepartment = await tx.department.create({
        data: {
          name: dto.department.name,
          description: dto.department.description,
        },
        select: {
          id: true,
          name: true,
          isActive: true,
          createdAt: true,
        },
      });

      const account = await tx.user.create({
        data: {
          name: dto.account.name,
          email: dto.account.email,
          passwordHash,
          role: Role.DEPARTMENT,
          departmentId: createdDepartment.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      return {
        ...createdDepartment,
        account,
      };
    });

    return department;
  }

  async findAll(
    query: FindAllDepartmentsDto,
  ): Promise<FindAllDepartmentListResponse> {
    const { page, limit, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }),
      ...(isActive !== undefined && { isActive }),
    };

    const [departments, total] = await this.prismaService.$transaction([
      this.prismaService.department.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          description: true,
          isActive: true,
          createdAt: true,
          users: {
            where: {
              role: Role.DEPARTMENT,
            },
            take: 1,
            select: {
              id: true,
              email: true,
            },
          },
          _count: {
            select: {
              complaints: true,
            },
          },
          complaints: {
            select: {
              status: true,
            },
          },
        },
      }),
      this.prismaService.department.count({ where }),
    ]);

    const data = departments.map((department) => {
      const pendingComplaints = department.complaints.filter(
        ({ status }) =>
          status === ComplaintStatus.SUBMITTED ||
          status === ComplaintStatus.UNDER_REVIEW ||
          status === ComplaintStatus.IN_PROGRESS,
      ).length;

      const resolvedComplaints = department.complaints.filter(
        ({ status }) =>
          status === ComplaintStatus.RESOLVED ||
          status === ComplaintStatus.CLOSED,
      ).length;

      return {
        id: department.id,
        name: department.name,
        description: department.description,
        isActive: department.isActive,
        totalComplaints: department._count.complaints,
        pendingComplaints,
        resolvedComplaints,
        account: department.users[0] ?? null,
        createdAt: department.createdAt,
      };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<FindOneDepartmentDetailResponse> {
    const department = await this.prismaService.department.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        createdAt: true,
        users: {
          where: {
            role: Role.DEPARTMENT,
          },
          take: 1,
          select: {
            id: true,
            email: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
          orderBy: {
            name: 'asc',
          },
        },
        complaints: {
          select: {
            status: true,
            rating: true,
            createdAt: true,
            closedAt: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    const pendingComplaints = department.complaints.filter(
      ({ status }) =>
        status === ComplaintStatus.SUBMITTED ||
        status === ComplaintStatus.UNDER_REVIEW ||
        status === ComplaintStatus.IN_PROGRESS,
    ).length;

    const resolvedComplaints = department.complaints.filter(
      ({ status }) =>
        status === ComplaintStatus.RESOLVED ||
        status === ComplaintStatus.CLOSED,
    ).length;

    const resolutionTimes = department.complaints
      .filter(({ closedAt }) => closedAt)
      .map(({ createdAt, closedAt }) => {
        return (
          (closedAt!.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
      });

    const avgResolutionDays =
      resolutionTimes.length > 0
        ? Number(
            (
              resolutionTimes.reduce((sum, days) => sum + days, 0) /
              resolutionTimes.length
            ).toFixed(1),
          )
        : 0;

    const ratings = department.complaints
      .map(({ rating }) => rating)
      .filter((rating): rating is number => rating !== null);

    const avgRating =
      ratings.length > 0
        ? Number(
            (
              ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
            ).toFixed(1),
          )
        : null;

    return {
      id: department.id,
      name: department.name,
      description: department.description,
      isActive: department.isActive,
      totalComplaints: department.complaints.length,
      pendingComplaints,
      resolvedComplaints,
      avgResolutionDays,
      avgRating,
      categories: department.categories,
      account: department.users[0] ?? null,
      createdAt: department.createdAt,
    };
  }

  async update(
    id: string,
    dto: UpdateDepartmentDto,
  ): Promise<UpdateDepartmentResponse> {
    const department = await this.prismaService.department.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return this.prismaService.department.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async findPublic(): Promise<PublicDepartmentResponse[]> {
    return await this.prismaService.department.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
