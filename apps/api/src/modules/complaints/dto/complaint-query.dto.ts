import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const FindAllComplaintQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit must not exceed 100')
      .default(10),
    status: z
      .enum(
        ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
        'Invalid complaint status',
      )
      .optional(),
    categoryId: z
      .string()
      .trim()
      .min(1, 'Category ID cannot be empty')
      .optional(),
    departmentId: z
      .string()
      .trim()
      .min(1, 'Department ID cannot be empty')
      .optional(),
    search: z
      .string()
      .trim()
      .max(100, 'Search must not exceed 100 characters')
      .optional(),
    sortOrder: z.enum(['asc', 'desc'], 'Invalid sort order').default('desc'),
  })
  .strict();

export class FindAllComplaintQueryDto extends createZodDto(
  FindAllComplaintQuerySchema,
) {}
