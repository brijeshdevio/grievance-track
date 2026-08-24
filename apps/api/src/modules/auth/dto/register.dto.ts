import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const RegisterSchema = z
  .object({
    name: z
      .string('Name is required')
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters'),
    email: z
      .email('Enter a valid email address')
      .max(100, 'Email must not exceed 100 characters'),
    password: z
      .string('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(40, 'Password must not exceed 40 characters'),
  })
  .strict();

export class RegisterDto extends createZodDto(RegisterSchema) {}
