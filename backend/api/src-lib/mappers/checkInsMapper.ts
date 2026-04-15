import type { CheckIn } from '@/stores/activityStore';

export type CheckInRow = {
  id: string;
  user_id: string;
  note: string;
  created_at: string;
};

export function mapCheckInRowToModel(row: CheckInRow): CheckIn {
  return {
    id: row.id,
    note: row.note,
    createdAt: row.created_at,
  };
}

