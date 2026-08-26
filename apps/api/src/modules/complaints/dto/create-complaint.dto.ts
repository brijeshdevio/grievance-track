import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const CreateComplaintSchema = z
  .object({
    title: z
      .string('Title is required')
      .trim()
      .min(1, 'Title is required')
      .max(100, 'Title must not exceed 100 characters'),

    description: z
      .string('Description is required')
      .trim()
      .min(1, 'Description is required')
      .max(200),

    categoryId: z
      .string('Category ID is required')
      .trim()
      .min(1, 'Category ID is required'),

    location: z
      .string('Location is required')
      .trim()
      .min(1, 'Location is required')
      .max(100, 'Location must not exceed 100 characters'),
  })
  .strict();

export class CreateComplaintDto extends createZodDto(CreateComplaintSchema) {}
