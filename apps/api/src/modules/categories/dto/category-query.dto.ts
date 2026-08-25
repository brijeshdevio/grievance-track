import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const FindAllCategoriesQuerySchema = z
  .object({
    page: z.coerce
      .number()
      .int('Page must be an integer')
      .min(1, 'Page must be at least 1')
      .default(1),

    limit: z.coerce
      .number()
      .int('Limit must be an integer')
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit must not exceed 100')
      .default(10),

    search: z
      .string('Search must be a string')
      .trim()
      .min(1, 'Search must not be empty')
      .max(100, 'Search must not exceed 100 characters')
      .optional(),

    departmentId: z
      .string('Department ID must be a string')
      .min(1, 'Department ID is required')
      .optional(),

    isActive: z
      .enum(['true', 'false'], 'isActive must be true or false')
      .transform((value) => value === 'true')
      .optional(),
  })
  .strict();

export class FindAllCategoriesDto extends createZodDto(
  FindAllCategoriesQuerySchema,
) {}
