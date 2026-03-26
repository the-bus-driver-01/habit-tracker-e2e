import {
  HabitFormData,
  ValidationResult,
  ValidationError,
  HabitCategory,
  HabitFrequency
} from './types';

export class DataValidator {
  private static readonly HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
  private static readonly TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

  static validateHabit(data: Partial<HabitFormData>): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate name
    if (!data.name || typeof data.name !== 'string') {
      errors.push({ field: 'name', message: 'Name is required' });
    } else if (data.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Name cannot be empty' });
    } else if (data.name.trim().length > 100) {
      errors.push({ field: 'name', message: 'Name must be 100 characters or less' });
    }

    // Validate description
    if (data.description && data.description.trim().length > 500) {
      errors.push({ field: 'description', message: 'Description must be 500 characters or less' });
    }

    // Validate category
    if (!data.category) {
      errors.push({ field: 'category', message: 'Category is required' });
    } else if (!Object.values(HabitCategory).includes(data.category)) {
      errors.push({ field: 'category', message: 'Invalid category selected' });
    }

    // Validate frequency
    if (!data.frequency) {
      errors.push({ field: 'frequency', message: 'Frequency is required' });
    } else if (!Object.values(HabitFrequency).includes(data.frequency)) {
      errors.push({ field: 'frequency', message: 'Invalid frequency selected' });
    }

    // Validate target count
    if (data.targetCount === undefined || data.targetCount === null) {
      errors.push({ field: 'targetCount', message: 'Target count is required' });
    } else if (!Number.isInteger(data.targetCount) || data.targetCount < 1 || data.targetCount > 100) {
      errors.push({ field: 'targetCount', message: 'Target count must be between 1 and 100' });
    }

    // Validate color (optional)
    if (data.color && !this.HEX_COLOR_REGEX.test(data.color)) {
      errors.push({ field: 'color', message: 'Color must be a valid hex format (#RRGGBB)' });
    }

    // Validate reminder time (optional)
    if (data.reminderTime && !this.TIME_REGEX.test(data.reminderTime)) {
      errors.push({ field: 'reminderTime', message: 'Reminder time must be in HH:MM format' });
    }

    // Validate goal and motivation (optional, max length)
    if (data.goal && data.goal.trim().length > 500) {
      errors.push({ field: 'goal', message: 'Goal must be 500 characters or less' });
    }

    if (data.motivation && data.motivation.trim().length > 500) {
      errors.push({ field: 'motivation', message: 'Motivation must be 500 characters or less' });
    }

    // Validate custom frequency (if frequency is CUSTOM)
    if (data.frequency === HabitFrequency.CUSTOM) {
      if (!data.customFrequency || !data.customFrequency.days || data.customFrequency.days < 1) {
        errors.push({ field: 'customFrequency', message: 'Custom frequency days must be specified and greater than 0' });
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static sanitizeHabit(data: HabitFormData): HabitFormData {
    return {
      ...data,
      name: data.name?.trim().substring(0, 100) || '',
      description: data.description?.trim().substring(0, 500) || undefined,
      targetCount: Math.max(1, Math.min(100, Math.floor(data.targetCount || 1))),
      color: data.color?.toLowerCase(),
      reminderTime: data.reminderTime?.trim(),
      goal: data.goal?.trim().substring(0, 500) || undefined,
      motivation: data.motivation?.trim().substring(0, 500) || undefined,
    };
  }

  static getErrorMessage(field: string, errors: ValidationError[]): string | undefined {
    const error = errors.find(e => e.field === field);
    return error?.message;
  }
}

// Helper function to get display names for enums
export const getCategoryDisplayName = (category: HabitCategory): string => {
  const names: Record<HabitCategory, string> = {
    [HabitCategory.HEALTH]: 'Health',
    [HabitCategory.PRODUCTIVITY]: 'Productivity',
    [HabitCategory.LEARNING]: 'Learning',
    [HabitCategory.LIFESTYLE]: 'Lifestyle',
    [HabitCategory.FITNESS]: 'Fitness',
    [HabitCategory.MINDFULNESS]: 'Mindfulness',
    [HabitCategory.SOCIAL]: 'Social',
    [HabitCategory.OTHER]: 'Other',
  };
  return names[category];
};

export const getFrequencyDisplayName = (frequency: HabitFrequency): string => {
  const names: Record<HabitFrequency, string> = {
    [HabitFrequency.DAILY]: 'Daily',
    [HabitFrequency.WEEKLY]: 'Weekly',
    [HabitFrequency.MONTHLY]: 'Monthly',
    [HabitFrequency.CUSTOM]: 'Custom',
  };
  return names[frequency];
};