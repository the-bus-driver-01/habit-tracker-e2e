'use client';

import React, { useState } from 'react';
import {
  HabitFormData,
  HabitCategory,
  HabitFrequency,
  ValidationError
} from '../../lib/types';
import { DataValidator, getCategoryDisplayName, getFrequencyDisplayName } from '../../lib/validation';
import { useHabits } from '../../hooks/useHabits';

interface HabitFormProps {
  onSuccess?: (habitId: string) => void;
  onCancel?: () => void;
  className?: string;
}

const WEEKDAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export function HabitForm({ onSuccess, onCancel, className = '' }: HabitFormProps) {
  const { createHabit, isLoading } = useHabits();

  const [formData, setFormData] = useState<HabitFormData>({
    name: '',
    description: '',
    category: HabitCategory.OTHER,
    frequency: HabitFrequency.DAILY,
    targetCount: 1,
    color: '#3B82F6',
    reminderTime: '',
    goal: '',
    motivation: '',
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [submitError, setSubmitError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getFieldError = (field: string): string | undefined => {
    return DataValidator.getErrorMessage(field, validationErrors);
  };

  const handleInputChange = (field: keyof HabitFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation errors for this field
    if (validationErrors.some(e => e.field === field)) {
      setValidationErrors(prev => prev.filter(e => e.field !== field));
    }
  };

  const handleCustomFrequencyChange = (field: 'days' | 'weekdays', value: any) => {
    setFormData(prev => ({
      ...prev,
      customFrequency: {
        ...prev.customFrequency,
        [field]: value,
      },
    }));
  };

  const validateForm = (): boolean => {
    const validation = DataValidator.validateHabit(formData);
    setValidationErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const sanitizedData = DataValidator.sanitizeHabit(formData);
      const result = await createHabit(sanitizedData);

      if (result.success && result.data) {
        // Reset form
        setFormData({
          name: '',
          description: '',
          category: HabitCategory.OTHER,
          frequency: HabitFrequency.DAILY,
          targetCount: 1,
          color: '#3B82F6',
          reminderTime: '',
          goal: '',
          motivation: '',
        });
        setValidationErrors([]);

        onSuccess?.(result.data.id);
      } else {
        setSubmitError(result.error?.message || 'Failed to create habit');
      }
    } catch (error) {
      setSubmitError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      category: HabitCategory.OTHER,
      frequency: HabitFrequency.DAILY,
      targetCount: 1,
      color: '#3B82F6',
      reminderTime: '',
      goal: '',
      motivation: '',
    });
    setValidationErrors([]);
    setSubmitError('');
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Habit</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Habit Name *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              getFieldError('name') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Drink 8 glasses of water"
            maxLength={100}
            disabled={isSubmitting}
          />
          {getFieldError('name') && (
            <p className="text-red-600 text-sm mt-1">{getFieldError('name')}</p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
              getFieldError('description') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Optional: Add more details about your habit"
            rows={3}
            maxLength={500}
            disabled={isSubmitting}
          />
          {getFieldError('description') && (
            <p className="text-red-600 text-sm mt-1">{getFieldError('description')}</p>
          )}
        </div>

        {/* Category and Frequency Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Field */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value as HabitCategory)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getFieldError('category') ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              {Object.values(HabitCategory).map((category) => (
                <option key={category} value={category}>
                  {getCategoryDisplayName(category)}
                </option>
              ))}
            </select>
            {getFieldError('category') && (
              <p className="text-red-600 text-sm mt-1">{getFieldError('category')}</p>
            )}
          </div>

          {/* Frequency Field */}
          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
              Frequency *
            </label>
            <select
              id="frequency"
              value={formData.frequency}
              onChange={(e) => handleInputChange('frequency', e.target.value as HabitFrequency)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getFieldError('frequency') ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              {Object.values(HabitFrequency).map((frequency) => (
                <option key={frequency} value={frequency}>
                  {getFrequencyDisplayName(frequency)}
                </option>
              ))}
            </select>
            {getFieldError('frequency') && (
              <p className="text-red-600 text-sm mt-1">{getFieldError('frequency')}</p>
            )}
          </div>
        </div>

        {/* Custom Frequency Settings */}
        {formData.frequency === HabitFrequency.CUSTOM && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Custom Frequency Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customDays" className="block text-sm font-medium text-gray-700 mb-1">
                  Every X days
                </label>
                <input
                  id="customDays"
                  type="number"
                  min="1"
                  max="365"
                  value={formData.customFrequency?.days || ''}
                  onChange={(e) => handleCustomFrequencyChange('days', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specific Weekdays
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {WEEKDAYS.map(({ value, label }) => (
                    <label key={value} className="flex items-center text-xs">
                      <input
                        type="checkbox"
                        checked={formData.customFrequency?.weekdays?.includes(value) || false}
                        onChange={(e) => {
                          const currentWeekdays = formData.customFrequency?.weekdays || [];
                          const newWeekdays = e.target.checked
                            ? [...currentWeekdays, value]
                            : currentWeekdays.filter(d => d !== value);
                          handleCustomFrequencyChange('weekdays', newWeekdays);
                        }}
                        className="mr-1"
                        disabled={isSubmitting}
                      />
                      {label.slice(0, 3)}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {getFieldError('customFrequency') && (
              <p className="text-red-600 text-sm mt-2">{getFieldError('customFrequency')}</p>
            )}
          </div>
        )}

        {/* Target Count and Color Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Target Count Field */}
          <div>
            <label htmlFor="targetCount" className="block text-sm font-medium text-gray-700 mb-1">
              Target Count *
            </label>
            <input
              id="targetCount"
              type="number"
              min="1"
              max="100"
              value={formData.targetCount}
              onChange={(e) => handleInputChange('targetCount', parseInt(e.target.value) || 1)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getFieldError('targetCount') ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {getFieldError('targetCount') && (
              <p className="text-red-600 text-sm mt-1">{getFieldError('targetCount')}</p>
            )}
          </div>

          {/* Color Field */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="color"
                type="color"
                value={formData.color || '#3B82F6'}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="h-10 w-16 border border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
                disabled={isSubmitting}
              />
              <input
                type="text"
                value={formData.color || ''}
                onChange={(e) => handleInputChange('color', e.target.value)}
                placeholder="#3B82F6"
                className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  getFieldError('color') ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
            </div>
            {getFieldError('color') && (
              <p className="text-red-600 text-sm mt-1">{getFieldError('color')}</p>
            )}
          </div>
        </div>

        {/* Reminder Time Field */}
        <div>
          <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700 mb-1">
            Reminder Time
          </label>
          <input
            id="reminderTime"
            type="time"
            value={formData.reminderTime || ''}
            onChange={(e) => handleInputChange('reminderTime', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              getFieldError('reminderTime') ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {getFieldError('reminderTime') && (
            <p className="text-red-600 text-sm mt-1">{getFieldError('reminderTime')}</p>
          )}
        </div>

        {/* Goal Field */}
        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">
            Goal
          </label>
          <textarea
            id="goal"
            value={formData.goal || ''}
            onChange={(e) => handleInputChange('goal', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
              getFieldError('goal') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="What do you hope to achieve with this habit?"
            rows={2}
            maxLength={500}
            disabled={isSubmitting}
          />
          {getFieldError('goal') && (
            <p className="text-red-600 text-sm mt-1">{getFieldError('goal')}</p>
          )}
        </div>

        {/* Motivation Field */}
        <div>
          <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-1">
            Motivation
          </label>
          <textarea
            id="motivation"
            value={formData.motivation || ''}
            onChange={(e) => handleInputChange('motivation', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
              getFieldError('motivation') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="What motivates you to build this habit?"
            rows={2}
            maxLength={500}
            disabled={isSubmitting}
          />
          {getFieldError('motivation') && (
            <p className="text-red-600 text-sm mt-1">{getFieldError('motivation')}</p>
          )}
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-800 text-sm">{submitError}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Habit'}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none bg-white text-gray-700 px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}