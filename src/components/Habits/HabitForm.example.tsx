/**
 * Example usage of the HabitForm component
 *
 * This file demonstrates how to integrate the HabitForm into your application
 */

'use client';

import React, { useState } from 'react';
import { HabitForm } from './HabitForm';

export function HabitFormExample() {
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSuccess = (habitId: string) => {
    console.log('Habit created successfully with ID:', habitId);
    setSuccessMessage(`Habit created successfully!`);
    setShowForm(false);

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Habit Tracker</h1>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Form Toggle */}
      {!showForm ? (
        <div className="text-center">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create New Habit
          </button>
        </div>
      ) : (
        <HabitForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          className="max-w-2xl mx-auto"
        />
      )}

      {/* Usage Notes */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Usage Notes</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Fill out the habit name and select a category</li>
          <li>• Choose how often you want to perform this habit</li>
          <li>• Set a target count for each period</li>
          <li>• Optionally add a description, goal, and motivation</li>
          <li>• Select a color to help identify your habit</li>
          <li>• Set a reminder time if you want notifications</li>
          <li>• Use custom frequency for more flexible scheduling</li>
        </ul>
      </div>
    </div>
  );
}

// Example of using the form in a modal
export function HabitFormModal() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = (habitId: string) => {
    console.log('Habit created:', habitId);
    setIsOpen(false);
    // Add your success handling here (e.g., show toast, refresh data)
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Add Habit
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <HabitForm
          onSuccess={handleSuccess}
          onCancel={() => setIsOpen(false)}
        />
      </div>
    </div>
  );
}

// Example of validation handling
export function HabitFormValidationExample() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState<string[]>([]);

  // This shows how you might handle validation externally
  const handleFormSubmit = async (data: any) => {
    try {
      // Your validation logic here
      console.log('Form data:', data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <HabitForm
        onSuccess={(habitId) => {
          console.log('Success:', habitId);
        }}
        className="border border-gray-200"
      />
    </div>
  );
}