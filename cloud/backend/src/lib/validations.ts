import { z } from "zod";

/**
 * Validation schema for station creation/editing
 */
export const stationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug must be less than 50 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  address: z
    .string()
    .max(200, "Address must be less than 200 characters")
    .optional()
    .nullable(),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .nullable(),
  musicGenre: z
    .string()
    .max(50, "Music genre must be less than 50 characters")
    .optional()
    .nullable(),
  contactEmail: z
    .string()
    .email("Invalid email address")
    .max(100, "Email must be less than 100 characters"),
  contactPhone: z
    .string()
    .max(20, "Phone must be less than 20 characters")
    .optional()
    .nullable(),
  streamUrlPrimary: z
    .string()
    .url("Invalid URL")
    .max(255, "URL must be less than 255 characters"),
  streamUrlBackup: z
    .string()
    .url("Invalid URL")
    .max(255, "URL must be less than 255 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  subscriptionDueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  brandingPrimaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code (e.g., #FF5733)")
    .optional()
    .nullable()
    .or(z.literal("")),
  brandingSecondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code (e.g., #FF5733)")
    .optional()
    .nullable()
    .or(z.literal("")),
  brandingLogoUrl: z
    .string()
    .url("Invalid URL")
    .max(255, "URL must be less than 255 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type StationFormData = z.infer<typeof stationSchema>;

/**
 * Validation schema for login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
