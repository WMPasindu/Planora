import type { CheckIn } from '@/stores/activityStore';

import { mapCheckInRowToModel, type CheckInRow } from '@/lib/mappers/checkInsMapper';
import { apiRequest } from './client';

export async function fetchCheckIns(): Promise<CheckIn[]> {
  const data = await apiRequest<CheckInRow[]>('/v1/check-ins');
  return data.map(mapCheckInRowToModel);
}

export async function createCheckInRemote(checkIn: CheckIn): Promise<CheckIn> {
  const data = await apiRequest<CheckInRow>('/v1/check-ins', {
    method: 'POST',
    body: { id: checkIn.id, note: checkIn.note, createdAt: checkIn.createdAt },
  });
  return mapCheckInRowToModel(data);
}

