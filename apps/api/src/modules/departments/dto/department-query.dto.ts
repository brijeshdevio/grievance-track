import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const FindAllDepartmentsSchema = z
  .object({
    page: z.coerce
      .number('Page must be a number')
      .int('Page must be an integer')
      .min(1, 'Page must be at least 1')
      .default(1),
    limit: z.coerce
      .number('Limit must be a number')
      .int('Limit must be an integer')
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit must not exceed 100')
      .default(10),
    search: z
      .string('Search must be a string')
      .trim()
      .max(100, 'Search must not exceed 100 characters')
      .optional(),
    isActive: z
      .enum(['true', 'false'], 'isActive must be true or false')
      .transform((value) => value === 'true')
      .optional(),
  })
  .strict();

export class FindAllDepartmentsDto extends createZodDto(
  FindAllDepartmentsSchema,
) {}
