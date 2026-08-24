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

import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { FindAllDepartmentsDto } from './dto/department-query.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Roles(Role.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateDepartmentDto) {
    const data = await this.departmentsService.create(body);
    return { data };
  }

  @Roles(Role.ADMIN)
  @Get()
  async findAll(@Query() query: FindAllDepartmentsDto) {
    return { data: await this.departmentsService.findAll(query) };
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateDepartmentDto) {
    return {
      data: await this.departmentsService.update(id, body),
    };
  }

  @Get('public')
  async findPublic() {
    return {
      data: await this.departmentsService.findPublic(),
    };
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { data: await this.departmentsService.findOne(id) };
  }
}
