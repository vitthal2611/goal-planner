import AtomicHabit from '../models/AtomicHabit';
import HabitCompletion from '../models/HabitCompletion';
import { format, subDays } from 'date-fns';

export const sampleHabits = [
  new AtomicHabit({
    id: '1',
    name: 'I am a person who walks for 10 minutes',
    trigger: 'After morning coffee',
    time: '08:30',
    location: 'Around the block',
    frequency: 'daily',
    startDate: format(subDays(new Date(), 10), 'yyyy-MM-dd')
  }),
  
  new AtomicHabit({
    id: '2',
    name: 'I am a person who reads one page',
    trigger: 'Before bed',
    time: '21:00',
    location: 'Bedroom',
    frequency: 'daily',
    startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd')
  }),
  
  new AtomicHabit({
    id: '3',
    name: 'I am a person who writes three sentences',
    trigger: 'After lunch',
    time: '13:30',
    location: 'Desk',
    frequency: 'weekly',
    weeklyDays: [1, 2, 3, 4, 5], // Monday to Friday
    startDate: format(subDays(new Date(), 5), 'yyyy-MM-dd')
  }),
  
  new AtomicHabit({
    id: '4',
    name: 'I am a person who drinks a glass of water',
    trigger: 'When I wake up',
    time: '07:00',
    location: 'Kitchen',
    frequency: 'daily',
    startDate: format(subDays(new Date(), 14), 'yyyy-MM-dd')
  })
];

// Generate sample completions for the last 14 days
export const generateSampleCompletions = () => {
  const completions = [];
  const today = new Date();
  
  // Create realistic completion patterns
  const completionPatterns = {
    '1': 0.8, // 80% completion rate
    '2': 0.7, // 70% completion rate  
    '3': 0.9, // 90% completion rate (weekly habit)
    '4': 0.85 // 85% completion rate
  };
  
  for (let i = 0; i < 14; i++) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    sampleHabits.forEach(habit => {
      if (habit.isScheduledForDate(date)) {
        const shouldComplete = Math.random() < completionPatterns[habit.id];
        
        if (shouldComplete) {
          completions.push(new HabitCompletion({
            id: `${habit.id}-${dateStr}`,
            habitId: habit.id,
            date: dateStr,
            completed: true,
            completedAt: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString()
          }));
        }
      }
    });
  }
  
  return completions;
};

export const loadSampleData = () => {
  localStorage.setItem('atomic_habits', JSON.stringify(sampleHabits));
  localStorage.setItem('habit_completions', JSON.stringify(generateSampleCompletions()));
};