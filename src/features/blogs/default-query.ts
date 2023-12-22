export class BlogsDefaultQuery {
  sortBy: string = 'createdAt';
  sortDirection: 'desc' | 'asc' = 'desc';
  pageNumber: number = 1;
  pageSize: number = 10;
}
