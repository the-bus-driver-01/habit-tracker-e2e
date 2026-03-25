import { Habit, CheckIn } from '@/types/habit';

export const sampleHabits: Habit[] = [
  {
    id: 'habit-1',
    name: 'Exercise',
    description: 'Daily workout or physical activity',
    color: '#3B82F6', // Blue
    createdAt: new Date('2024-01-01'),
    isActive: true
  },
  {
    id: 'habit-2',
    name: 'Read',
    description: 'Read for at least 30 minutes',
    color: '#10B981', // Green
    createdAt: new Date('2024-01-01'),
    isActive: true
  },
  {
    id: 'habit-3',
    name: 'Meditate',
    description: 'Daily meditation practice',
    color: '#8B5CF6', // Purple
    createdAt: new Date('2024-01-05'),
    isActive: true
  },
  {
    id: 'habit-4',
    name: 'Write Journal',
    description: 'Write in personal journal',
    color: '#F59E0B', // Amber
    createdAt: new Date('2024-01-01'),
    isActive: true
  },
  {
    id: 'habit-5',
    name: 'Drink Water',
    description: 'Drink 8 glasses of water',
    color: '#06B6D4', // Cyan
    createdAt: new Date('2024-01-01'),
    isActive: false // Inactive habit
  }
];

export const sampleCheckIns: CheckIn[] = [
  // March 20, 2026 - Mixed completion
  {
    id: 'checkin-1',
    habitId: 'habit-1',
    date: '2026-03-20',
    completed: true,
    createdAt: new Date('2026-03-20T08:00:00'),
    updatedAt: new Date('2026-03-20T08:00:00')
  },
  {
    id: 'checkin-2',
    habitId: 'habit-2',
    date: '2026-03-20',
    completed: true,
    createdAt: new Date('2026-03-20T20:00:00'),
    updatedAt: new Date('2026-03-20T20:00:00')
  },
  {
    id: 'checkin-3',
    habitId: 'habit-4',
    date: '2026-03-20',
    completed: false,
    createdAt: new Date('2026-03-20T22:00:00'),
    updatedAt: new Date('2026-03-20T22:00:00')
  },

  // March 21, 2026 - Full completion
  {
    id: 'checkin-4',
    habitId: 'habit-1',
    date: '2026-03-21',
    completed: true,
    createdAt: new Date('2026-03-21T07:30:00'),
    updatedAt: new Date('2026-03-21T07:30:00')
  },
  {
    id: 'checkin-5',
    habitId: 'habit-2',
    date: '2026-03-21',
    completed: true,
    createdAt: new Date('2026-03-21T19:00:00'),
    updatedAt: new Date('2026-03-21T19:00:00')
  },
  {
    id: 'checkin-6',
    habitId: 'habit-3',
    date: '2026-03-21',
    completed: true,
    createdAt: new Date('2026-03-21T06:00:00'),
    updatedAt: new Date('2026-03-21T06:00:00')
  },
  {
    id: 'checkin-7',
    habitId: 'habit-4',
    date: '2026-03-21',
    completed: true,
    createdAt: new Date('2026-03-21T21:30:00'),
    updatedAt: new Date('2026-03-21T21:30:00')
  },

  // March 22, 2026 - No completions (all marked as incomplete)
  {
    id: 'checkin-8',
    habitId: 'habit-1',
    date: '2026-03-22',
    completed: false,
    createdAt: new Date('2026-03-22T23:59:00'),
    updatedAt: new Date('2026-03-22T23:59:00')
  },
  {
    id: 'checkin-9',
    habitId: 'habit-2',
    date: '2026-03-22',
    completed: false,
    createdAt: new Date('2026-03-22T23:59:00'),
    updatedAt: new Date('2026-03-22T23:59:00')
  },

  // March 24, 2026 - Partial completion
  {
    id: 'checkin-10',
    habitId: 'habit-1',
    date: '2026-03-24',
    completed: true,
    createdAt: new Date('2026-03-24T08:15:00'),
    updatedAt: new Date('2026-03-24T08:15:00')
  },
  {
    id: 'checkin-11',
    habitId: 'habit-3',
    date: '2026-03-24',
    completed: false,
    createdAt: new Date('2026-03-24T22:00:00'),
    updatedAt: new Date('2026-03-24T22:00:00')
  },
];