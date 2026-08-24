import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const LoginSchema = z
  .object({
    email: z
      .email('Enter a valid email address')
      .max(100, 'Email must not exceed 100 characters'),
    password: z
      .string('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(40, 'Password must not exceed 40 characters'),
  })
  .strict();

export class LoginDto extends createZodDto(LoginSchema) {}
