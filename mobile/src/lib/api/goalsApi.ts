import type { TrackedGoal } from '@/types';

import { mapGoalModelToInsert, mapGoalRowToModel, type GoalRow } from '@/lib/mappers/goalsMapper';
import { getCurrentUserId, supabase } from '@/lib/supabase/client';

export async function fetchGoals(): Promise<TrackedGoal[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as GoalRow[]).map(mapGoalRowToModel);
}

export async function createGoalRemote(goal: TrackedGoal): Promise<TrackedGoal> {
  const userId = await getCurrentUserId();
  const payload = mapGoalModelToInsert(goal, userId);
  const { data, error } = await supabase.from('goals').insert(payload).select('*').single();
  if (error) throw error;
  return mapGoalRowToModel(data as GoalRow);
}

export async function updateGoalRemote(id: string, patch: Partial<TrackedGoal>): Promise<TrackedGoal> {
  const payload: Record<string, unknown> = {};
  if (patch.title !== undefined) payload.title = patch.title;
  if (patch.logged !== undefined) payload.logged = patch.logged;
  if (patch.target !== undefined) payload.target = patch.target;
  if (patch.progress !== undefined) payload.progress = patch.progress;
  if (patch.timerActive !== undefined) payload.timer_active = patch.timerActive;
  if (patch.cadence !== undefined) payload.cadence = patch.cadence;
  if (patch.startDate !== undefined) payload.start_date = patch.startDate;
  if (patch.endDate !== undefined) payload.end_date = patch.endDate;
  if (patch.ongoing !== undefined) payload.ongoing = patch.ongoing;
  if (patch.completedAt !== undefined) payload.completed_at = patch.completedAt;
  if (patch.scheduleStartMinutes !== undefined)
    payload.schedule_start_minutes = patch.scheduleStartMinutes;
  if (patch.scheduleDurationMinutes !== undefined)
    payload.schedule_duration_minutes = patch.scheduleDurationMinutes;
  if (patch.scheduleEndMinutes !== undefined) payload.schedule_end_minutes = patch.scheduleEndMinutes;
  if (patch.excludedDates !== undefined) payload.excluded_dates = patch.excludedDates;

  const { data, error } = await supabase.from('goals').update(payload).eq('id', id).select('*').single();
  if (error) throw error;
  return mapGoalRowToModel(data as GoalRow);
}

export async function removeGoalRemote(id: string): Promise<void> {
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw error;
}

