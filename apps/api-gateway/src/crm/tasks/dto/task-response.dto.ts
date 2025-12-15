import { TaskStatus, TaskPriority } from './create-task.dto';

export interface OwnerInfo {
  id: string;
  name: string;
}

export interface TaskResponseDto {
  id: string;
  taskNumber: string | null;
  ownerId: string | null;
  subject: string;
  dueDate: Date | null;
  description: string | null;
  notes: string | null;
  links: string[];
  priority: TaskPriority | null;
  status: TaskStatus | null;
  currency: string | null;
  exchangeRate: number | null;
  closedTime: Date | null;
  createdBy: string;
  modifiedBy: string;
  createdAt: Date;
  updatedAt: Date;
  Owner: OwnerInfo | null;
}

