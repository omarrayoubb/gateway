export interface CreateNoteRequest {
  title: string;
  note: string;
  noteOwner: string;
  relatedType: string;
  relatedId: string;
}

export interface UpdateNoteRequest {
  id: string;
  title?: string;
  note?: string;
  noteOwner?: string;
  relatedType?: string;
  relatedId?: string;
}

export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface FindOneNoteRequest {
  id: string;
}

export interface DeleteNoteRequest {
  id: string;
}

export interface BulkDeleteRequest {
  ids: string[];
}

export interface BulkUpdateRequest {
  ids: string[];
  update_fields: UpdateNoteFields;
}

export interface UpdateNoteFields {
  title?: string;
  note?: string;
  noteOwner?: string;
  relatedType?: string;
  relatedId?: string;
}

export interface NoteResponse {
  id: string;
  title: string;
  note: string;
  noteOwner: string;
  relatedType: string;
  relatedId: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedNotesResponse {
  data: NoteResponse[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DeleteNoteResponse {
  success: boolean;
  message?: string;
}

export interface BulkDeleteResponse {
  deleted_count: number;
  failed_ids?: FailedId[];
}

export interface FailedId {
  id: string;
  error: string;
}

export interface BulkUpdateResponse {
  updated_count: number;
  failed_items?: FailedItem[];
}

export interface FailedItem {
  id: string;
  error: string;
}

