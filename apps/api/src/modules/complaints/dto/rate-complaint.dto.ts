import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const RateComplaintSchema = z
  .object({
    rating: z
      .number('Rating is required')
      .int('Rating must be a whole number')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must not exceed 5'),
    ratingComment: z
      .string('Rating comment must be a string')
      .trim()
      .max(200, 'Rating comment must not exceed 200 characters')
      .optional(),
  })
  .strict();

export class RateComplaintDto extends createZodDto(RateComplaintSchema) {}
