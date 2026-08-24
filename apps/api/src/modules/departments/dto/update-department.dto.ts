import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const UpdateDepartmentSchema = z
  .object({
    name: z
      .string('Department name is required')
      .trim()
      .min(2, 'Department name must be at least 2 characters')
      .max(150, 'Department name must not exceed 150 characters')
      .optional(),
    description: z
      .string('Department description must be a string')
      .trim()
      .max(500, 'Department description must not exceed 500 characters')
      .optional(),
    isActive: z.boolean('isActive must be a boolean').optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export class UpdateDepartmentDto extends createZodDto(UpdateDepartmentSchema) {}
