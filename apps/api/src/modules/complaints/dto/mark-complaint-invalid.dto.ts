import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const MarkComplaintInvalidSchema = z
  .object({
    reason: z
      .string('Reason is required')
      .trim()
      .min(10, 'Reason is required')
      .max(200, 'Reason must not exceed 200 characters'),
  })
  .strict();

export class MarkComplaintInvalidDto extends createZodDto(
  MarkComplaintInvalidSchema,
) {}
