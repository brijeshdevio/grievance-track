import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const CreateCategorySchema = z
  .object({
    name: z
      .string('Category name is required')
      .trim()
      .min(2, 'Category name must be at least 2 characters')
      .max(100, 'Category name must not exceed 100 characters'),
    departmentId: z
      .string('Department ID is required')
      .min(1, 'Department ID is required'),
  })
  .strict();

export class CreateCategoryDto extends createZodDto(CreateCategorySchema) {}
