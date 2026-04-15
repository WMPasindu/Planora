import type { TrackedGoal } from '@/types';

import { mapGoalModelToInsert, mapGoalRowToModel, type GoalRow } from '@/lib/mappers/goalsMapper';
import { apiRequest } from './client';

export async function fetchGoals(): Promise<TrackedGoal[]> {
  const data = await apiRequest<GoalRow[]>('/v1/goals');
  return data.map(mapGoalRowToModel);
}

export async function createGoalRemote(goal: TrackedGoal): Promise<TrackedGoal> {
  const payload = mapGoalModelToInsert(goal);
  const data = await apiRequest<GoalRow>('/v1/goals', { method: 'POST', body: payload });
  return mapGoalRowToModel(data);
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

  const data = await apiRequest<GoalRow>(`/v1/goals/${id}`, { method: 'PATCH', body: payload });
  return mapGoalRowToModel(data);
}

export async function removeGoalRemote(id: string): Promise<void> {
  await apiRequest(`/v1/goals/${id}`, { method: 'DELETE' });
}

