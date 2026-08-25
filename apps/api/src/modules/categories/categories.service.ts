import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import {
  CreateCategoryResponse,
  FindAllCategoryListResponse,
  PublicCategoryResponse,
  UpdateCategoryResponse,
} from './types/categories.type';
import { FindAllCategoriesDto } from './dto/category-query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateCategoryDto): Promise<CreateCategoryResponse> {
    const department = await this.prismaService.department.findUnique({
      where: {
        id: dto.departmentId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return this.prismaService.category.create({
      data: {
        name: dto.name,
        departmentId: dto.departmentId,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        createdAt: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(
    query: FindAllCategoriesDto,
  ): Promise<FindAllCategoryListResponse> {
    const { page, limit, search, departmentId, isActive } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }),
      ...(departmentId && {
        departmentId,
      }),
      ...(isActive !== undefined && {
        isActive,
      }),
    };

    const [categories, total] = await this.prismaService.$transaction([
      this.prismaService.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          isActive: true,
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prismaService.category.count({
        where,
      }),
    ]);

    return {
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
  ): Promise<UpdateCategoryResponse> {
    const category = await this.prismaService.category.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (dto.departmentId) {
      const department = await this.prismaService.department.findUnique({
        where: { id: dto.departmentId },
        select: { id: true },
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }
    }

    return this.prismaService.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.departmentId !== undefined && {
          departmentId: dto.departmentId,
        }),
        ...(dto.isActive !== undefined && {
          isActive: dto.isActive,
        }),
      },
      select: {
        id: true,
        name: true,
        isActive: true,
        updatedAt: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findPublic(): Promise<PublicCategoryResponse[]> {
    return await this.prismaService.category.findMany({
      where: {
        isActive: true,
        department: {
          isActive: true,
        },
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        departmentId: true,
      },
    });
  }
}
