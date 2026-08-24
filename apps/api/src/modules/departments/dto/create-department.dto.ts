import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const CreateDepartmentSchema = z
  .object({
    account: z
      .object({
        name: z
          .string('Account name is required')
          .trim()
          .min(2, 'Account name must be at least 2 characters')
          .max(100, 'Account name must not exceed 100 characters'),

        email: z
          .email('Please provide a valid account email address')
          .max(255, 'Account email must not exceed 255 characters'),

        password: z
          .string('Account password is required')
          .min(8, 'Password must be at least 8 characters')
          .max(128, 'Password must not exceed 128 characters'),
      })
      .strict(),

    department: z
      .object({
        name: z
          .string('Department name is required')
          .trim()
          .min(2, 'Department name must be at least 2 characters')
          .max(150, 'Department name must not exceed 150 characters'),

        description: z
          .string('Department description must be a string')
          .trim()
          .max(500, 'Department description must not exceed 500 characters')
          .optional(),
      })
      .strict(),
  })
  .strict();

export class CreateDepartmentDto extends createZodDto(CreateDepartmentSchema) {}
