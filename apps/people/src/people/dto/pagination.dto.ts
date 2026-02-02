export class PaginationQueryDto {
  page?: number = 1;
  limit?: number = 10;
  search?: string;
  sort?: string;
  status?: string;
  department?: string;
}

