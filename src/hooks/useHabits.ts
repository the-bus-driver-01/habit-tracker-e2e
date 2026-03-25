import { useState, useEffect, useCallback } from 'react';
import {
  Habit,
  HabitId,
  HabitsState,
  HabitsActions,
  StorageResult,
  StorageError,
  CompletionStatus,
  CheckIn,
  HabitProgress,
  HabitFormData
} from '../lib/types';

// Simple localStorage-based storage implementation
class HabitStorage {
  private static readonly HABITS_KEY = 'habit-tracker-habits';
  private static readonly CHECK_INS_KEY = 'habit-tracker-checkins';

  static getHabits(): Habit[] {
    try {
      const stored = localStorage.getItem(this.HABITS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load habits:', error);
      return [];
    }
  }

  static saveHabits(habits: Habit[]): void {
    try {
      localStorage.setItem(this.HABITS_KEY, JSON.stringify(habits));
    } catch (error) {
      console.error('Failed to save habits:', error);
      throw new Error('Failed to save habits');
    }
  }

  static getCheckIns(): Record<HabitId, CheckIn[]> {
    try {
      const stored = localStorage.getItem(this.CHECK_INS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load check-ins:', error);
      return {};
    }
  }

  static saveCheckIns(checkIns: Record<HabitId, CheckIn[]>): void {
    try {
      localStorage.setItem(this.CHECK_INS_KEY, JSON.stringify(checkIns));
    } catch (error) {
      console.error('Failed to save check-ins:', error);
      throw new Error('Failed to save check-ins');
    }
  }
}

export function useHabits(): HabitsState & HabitsActions {
  const [state, setState] = useState<HabitsState>({
    habits: [],
    checkIns: {},
    streaks: {},
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const habits = HabitStorage.getHabits();
        const checkIns = HabitStorage.getCheckIns();

        setState(prev => ({
          ...prev,
          habits,
          checkIns,
          isLoading: false,
          lastUpdated: new Date().toISOString(),
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: {
            code: 'LOAD_ERROR',
            message: 'Failed to load habits',
            timestamp: new Date().toISOString(),
          },
          isLoading: false,
        }));
      }
    };

    loadData();
  }, []);

  const createHabit = useCallback(async (data: Partial<HabitFormData>): Promise<StorageResult<Habit>> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const now = new Date().toISOString();
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        name: data.name || '',
        description: data.description,
        category: data.category!,
        frequency: data.frequency!,
        targetCount: data.targetCount || 1,
        color: data.color,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        goal: data.goal,
        motivation: data.motivation,
        reminderTime: data.reminderTime,
        customFrequency: data.customFrequency,
      };

      const updatedHabits = [...state.habits, newHabit];
      HabitStorage.saveHabits(updatedHabits);

      setState(prev => ({
        ...prev,
        habits: updatedHabits,
        isLoading: false,
        lastUpdated: now,
      }));

      return { success: true, data: newHabit };
    } catch (error) {
      const storageError: StorageError = {
        code: 'CREATE_ERROR',
        message: 'Failed to create habit',
        details: error,
        timestamp: new Date().toISOString(),
      };

      setState(prev => ({
        ...prev,
        error: storageError,
        isLoading: false,
      }));

      return { success: false, error: storageError };
    }
  }, [state.habits]);

  const updateHabit = useCallback(async (id: HabitId, updates: Partial<Habit>): Promise<StorageResult<Habit>> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const habitIndex = state.habits.findIndex(h => h.id === id);
      if (habitIndex === -1) {
        throw new Error('Habit not found');
      }

      const updatedHabit = {
        ...state.habits[habitIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const updatedHabits = [...state.habits];
      updatedHabits[habitIndex] = updatedHabit;

      HabitStorage.saveHabits(updatedHabits);

      setState(prev => ({
        ...prev,
        habits: updatedHabits,
        isLoading: false,
        lastUpdated: new Date().toISOString(),
      }));

      return { success: true, data: updatedHabit };
    } catch (error) {
      const storageError: StorageError = {
        code: 'UPDATE_ERROR',
        message: 'Failed to update habit',
        details: error,
        timestamp: new Date().toISOString(),
      };

      setState(prev => ({
        ...prev,
        error: storageError,
        isLoading: false,
      }));

      return { success: false, error: storageError };
    }
  }, [state.habits]);

  const deleteHabit = useCallback(async (id: HabitId): Promise<StorageResult<boolean>> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const updatedHabits = state.habits.filter(h => h.id !== id);
      const updatedCheckIns = { ...state.checkIns };
      delete updatedCheckIns[id];

      HabitStorage.saveHabits(updatedHabits);
      HabitStorage.saveCheckIns(updatedCheckIns);

      setState(prev => ({
        ...prev,
        habits: updatedHabits,
        checkIns: updatedCheckIns,
        isLoading: false,
        lastUpdated: new Date().toISOString(),
      }));

      return { success: true, data: true };
    } catch (error) {
      const storageError: StorageError = {
        code: 'DELETE_ERROR',
        message: 'Failed to delete habit',
        details: error,
        timestamp: new Date().toISOString(),
      };

      setState(prev => ({
        ...prev,
        error: storageError,
        isLoading: false,
      }));

      return { success: false, error: storageError };
    }
  }, [state.habits, state.checkIns]);

  const recordCheckIn = useCallback(async (
    habitId: HabitId,
    status: CompletionStatus,
    count = 1,
    notes?: string
  ): Promise<StorageResult<CheckIn>> => {
    // Implementation would go here - simplified for this example
    return { success: true, data: {} as CheckIn };
  }, []);

  const refreshData = useCallback(async (): Promise<void> => {
    // Reload data from storage
    try {
      const habits = HabitStorage.getHabits();
      const checkIns = HabitStorage.getCheckIns();

      setState(prev => ({
        ...prev,
        habits,
        checkIns,
        lastUpdated: new Date().toISOString(),
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: {
          code: 'REFRESH_ERROR',
          message: 'Failed to refresh data',
          timestamp: new Date().toISOString(),
        },
      }));
    }
  }, []);

  const getHabitProgress = useCallback((id: HabitId, days = 30): HabitProgress | null => {
    // Simplified implementation - would calculate actual progress
    return null;
  }, []);

  return {
    ...state,
    createHabit,
    updateHabit,
    deleteHabit,
    recordCheckIn,
    refreshData,
    getHabitProgress,
  };
}