import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, RoleGuard } from '@/common/guards';
import { Roles } from '@/common/decorators';
import { Role } from '@/types/prisma.type';

import { CategoriesService } from './categories.service';
import { FindAllCategoriesDto } from './dto/category-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Roles(Role.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateCategoryDto) {
    return {
      data: await this.categoriesService.create(body),
    };
  }

  @Roles(Role.ADMIN)
  @Get()
  async findAll(@Query() query: FindAllCategoriesDto) {
    return {
      data: await this.categoriesService.findAll(query),
    };
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateCategoryDto) {
    return {
      data: await this.categoriesService.update(id, body),
    };
  }

  @Get('public')
  async findPublic() {
    return {
      data: await this.categoriesService.findPublic(),
    };
  }
}
