import { z } from 'zod';
import { MATCH_THRESHOLDS, REGIONS, VALIDATION, RATING_CONFIG, RUNTIME_CONFIG } from './constants';

/**
 * Validation schemas for all forms in the application
 * Uses Zod for runtime type checking and validation
 */

// Email validation schema
export const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
});

export type EmailFormData = z.infer<typeof emailSchema>;

// Profile setup validation schema
export const profileSchema = z.object({
  displayName: z
    .string()
    .min(VALIDATION.DISPLAY_NAME_MIN, `Name must be at least ${VALIDATION.DISPLAY_NAME_MIN} characters`)
    .max(VALIDATION.DISPLAY_NAME_MAX, `Name must be less than ${VALIDATION.DISPLAY_NAME_MAX} characters`)
    .regex(
      /^[a-zA-Z0-9\s\-_'.]+$/,
      'Name can only contain letters, numbers, spaces, hyphens, underscores, apostrophes, and periods'
    )
    .trim(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Group creation validation schema
export const groupSchema = z.object({
  name: z
    .string()
    .min(VALIDATION.GROUP_NAME_MIN, `Group name must be at least ${VALIDATION.GROUP_NAME_MIN} characters`)
    .max(VALIDATION.GROUP_NAME_MAX, `Group name must be less than ${VALIDATION.GROUP_NAME_MAX} characters`)
    .regex(
      /^[a-zA-Z0-9\s\-_'.&]+$/,
      'Group name can only contain letters, numbers, spaces, and basic punctuation'
    )
    .trim(),
  matchThreshold: z.enum(MATCH_THRESHOLDS, {
    message: 'Invalid match threshold',
  }).optional(),
  region: z.enum(REGIONS, {
    message: 'Invalid region',
  }).optional(),
  adultContent: z.boolean().optional(),
});

export type GroupFormData = z.infer<typeof groupSchema>;

// Join group validation schema
export const joinGroupSchema = z.object({
  inviteCode: z
    .string()
    .min(1, 'Invite code is required')
    .regex(
      /^[A-Z0-9]{6,12}$/,
      'Invalid invite code format'
    )
    .trim()
    .toUpperCase(),
});

export type JoinGroupFormData = z.infer<typeof joinGroupSchema>;

// Preferences validation schema
export const preferencesSchema = z.object({
  genres: z.array(z.string()).min(1, 'Select at least one genre').optional(),
  moods: z.array(z.string()).optional(),
  services: z.array(z.string()).min(1, 'Select at least one streaming service'),
  maxRuntime: z
    .number()
    .min(RUNTIME_CONFIG.MIN, `Runtime must be at least ${RUNTIME_CONFIG.MIN} minutes`)
    .max(RUNTIME_CONFIG.MAX, `Runtime must be less than ${RUNTIME_CONFIG.MAX} minutes`)
    .optional(),
  excludeWatched: z.boolean().optional(),
});

export type PreferencesFormData = z.infer<typeof preferencesSchema>;

// Rating validation schema
export const ratingSchema = z.object({
  rating: z
    .number()
    .min(RATING_CONFIG.MIN_STARS, `Rating must be at least ${RATING_CONFIG.MIN_STARS} star`)
    .max(RATING_CONFIG.MAX_STARS, `Rating must be at most ${RATING_CONFIG.MAX_STARS} stars`),
  reaction: z
    .string()
    .max(RATING_CONFIG.MAX_REACTION_LENGTH, `Reaction must be less than ${RATING_CONFIG.MAX_REACTION_LENGTH} characters`)
    .optional()
    .or(z.literal('')),
});

export type RatingFormData = z.infer<typeof ratingSchema>;

/**
 * Extracts error messages from a Zod validation error
 *
 * Transforms a ZodError into a flat object mapping field paths to error messages.
 * Useful for displaying validation errors in forms.
 *
 * @param error - The Zod error object from a failed validation
 * @returns An object mapping field paths (e.g., "email", "profile.name") to error messages
 *
 * @example
 * const result = schema.safeParse(data);
 * if (!result.success) {
 *   const errors = getZodErrorMessages(result.error);
 *   // { email: "Invalid email address", name: "Name is required" }
 * }
 */
export function getZodErrorMessages(error: z.ZodError<unknown>): Record<string, string> {
  const errors: Record<string, string> = {};
  error.issues.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  return errors;
}

/**
 * Validates data against a Zod schema and returns a type-safe result
 *
 * Provides a convenient wrapper around Zod's safeParse that returns either
 * the validated data or a formatted errors object. Useful for form validation
 * where you need to handle both success and error cases.
 *
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns Either `{ success: true, data: ValidatedData }` or `{ success: false, errors: ErrorMap }`
 *
 * @example
 * const result = validateSchema(emailSchema, formData);
 * if (result.success) {
 *   console.log(result.data.email);
 * } else {
 *   console.log(result.errors.email);
 * }
 */
export function validateSchema<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: getZodErrorMessages(result.error),
  };
}
