import { z } from 'zod';

export const contactFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  phone: z
    .string()
    .regex(/^[+]?[\d\s\-()]{10,15}$/, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email address'),
  eventType: z.string().min(1, 'Please select an event type'),
  eventDate: z.string().min(1, 'Event date is required'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  staffCount: z.coerce.number().min(1, 'Minimum 1 staff required'),
  staffRoles: z.string().min(2, 'Please describe the required staff roles'),
  message: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
