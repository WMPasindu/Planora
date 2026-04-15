import type { CheckIn } from '@/stores/activityStore';

import { mapCheckInRowToModel, type CheckInRow } from '@/lib/mappers/checkInsMapper';
import { getCurrentUserId, supabase } from '@/lib/supabase/client';

export async function fetchCheckIns(): Promise<CheckIn[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as CheckInRow[]).map(mapCheckInRowToModel);
}

export async function createCheckInRemote(checkIn: CheckIn): Promise<CheckIn> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('check_ins')
    .insert({ id: checkIn.id, user_id: userId, note: checkIn.note, created_at: checkIn.createdAt })
    .select('*')
    .single();
  if (error) throw error;
  return mapCheckInRowToModel(data as CheckInRow);
}

