import type { TrackedGoal } from '@/types';

export type GoalRow = {
  id: string;
  user_id: string;
  title: string;
  logged: string;
  target: string;
  progress: number;
  timer_active: boolean;
  cadence: 'daily' | 'weekly' | 'monthly';
  start_date: string;
  end_date: string | null;
  ongoing: boolean;
  completed_at: string | null;
  created_at: string;
  schedule_start_minutes: number | null;
  schedule_duration_minutes: number | null;
  schedule_end_minutes: number | null;
  excluded_dates: string[];
};

export type GoalInsert = Omit<GoalRow, 'created_at'>;

export function mapGoalRowToModel(row: GoalRow): TrackedGoal {
  return {
    id: row.id,
    title: row.title,
    logged: row.logged,
    target: row.target,
    progress: row.progress,
    timerActive: row.timer_active,
    cadence: row.cadence,
    startDate: row.start_date,
    endDate: row.end_date,
    ongoing: row.ongoing,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    scheduleStartMinutes: row.schedule_start_minutes,
    scheduleDurationMinutes: row.schedule_duration_minutes,
    scheduleEndMinutes: row.schedule_end_minutes,
    excludedDates: row.excluded_dates ?? [],
  };
}

export function mapGoalModelToInsert(goal: TrackedGoal, userId: string): GoalInsert {
  return {
    id: goal.id,
    user_id: userId,
    title: goal.title,
    logged: goal.logged,
    target: goal.target,
    progress: goal.progress,
    timer_active: goal.timerActive,
    cadence: goal.cadence,
    start_date: goal.startDate,
    end_date: goal.endDate,
    ongoing: goal.ongoing,
    completed_at: goal.completedAt,
    schedule_start_minutes: goal.scheduleStartMinutes,
    schedule_duration_minutes: goal.scheduleDurationMinutes,
    schedule_end_minutes: goal.scheduleEndMinutes,
    excluded_dates: goal.excludedDates ?? [],
  };
}

