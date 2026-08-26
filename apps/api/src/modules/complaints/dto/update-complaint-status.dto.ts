import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const UpdateComplaintStatusSchema = z
  .object({
    status: z.enum(
      ['UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      'Invalid complaint status',
    ),
    note: z
      .string('Note must be a string')
      .trim()
      .max(200, 'Note must not exceed 200 characters')
      .optional(),
  })
  .strict();

export class UpdateComplaintStatusDto extends createZodDto(
  UpdateComplaintStatusSchema,
) {}
