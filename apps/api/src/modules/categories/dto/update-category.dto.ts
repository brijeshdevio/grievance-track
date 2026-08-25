import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const UpdateCategorySchema = z
  .object({
    name: z
      .string('Category name must be a string')
      .trim()
      .min(2, 'Category name must be at least 2 characters')
      .max(100, 'Category name must not exceed 100 characters')
      .optional(),

    departmentId: z
      .string('Department ID must be a string')
      .min(1, 'Department ID is required')
      .optional(),

    isActive: z.boolean('isActive must be a boolean').optional(),
  })
  .strict();

export class UpdateCategoryDto extends createZodDto(UpdateCategorySchema) {}
