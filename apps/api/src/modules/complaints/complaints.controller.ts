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

import { CurrentUser, Roles } from '@/common/decorators';
import { Role } from '@/types/prisma.type';
import { JwtAuthGuard, RoleGuard } from '@/common/guards';

import { ComplaintsService } from './complaints.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { FindAllComplaintQueryDto } from './dto/complaint-query.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { MarkComplaintInvalidDto } from './dto/mark-complaint-invalid.dto';
import { RateComplaintDto } from './dto/rate-complaint.dto';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Roles(Role.CITIZEN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createComplaint(
    @CurrentUser('id') userId: string,
    @Body() body: CreateComplaintDto,
  ) {
    return {
      data: await this.complaintsService.create(userId, body),
    };
  }

  @Get()
  async findAll(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
    @Query() query: FindAllComplaintQueryDto,
  ) {
    return {
      data: await this.complaintsService.findAll(userId, role, query),
    };
  }

  @Get(':code')
  async findOne(
    @Param('code') code: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return {
      data: await this.complaintsService.findOne(code, userId, role),
    };
  }

  @Roles(Role.DEPARTMENT, Role.ADMIN)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateComplaintStatusDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return {
      data: await this.complaintsService.updateStatus(id, userId, role, body),
    };
  }

  @Roles(Role.DEPARTMENT, Role.ADMIN)
  @Patch(':id/invalid')
  async markInvalid(
    @Param('id') id: string,
    @Body() body: MarkComplaintInvalidDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return {
      data: await this.complaintsService.markInvalid(id, userId, role, body),
    };
  }

  @Roles(Role.CITIZEN)
  @Post(':id/rate')
  async rate(
    @Param() id: string,
    @Body() body: RateComplaintDto,
    @CurrentUser('id') userId: string,
  ) {
    return {
      data: await this.complaintsService.rate(id, userId, body),
    };
  }
}
