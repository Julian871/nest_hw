import { Transform } from 'class-transformer';

export class BlogsDefaultQuery {
  sortBy: string = 'createdAt';

  @Transform(({ value }) => {
    if (value.toLowerCase() === 'asc') {
      return 'ASC';
    } else {
      return 'DESC';
    }
  })
  sortDirection: 'DESC' | 'ASC' = 'DESC';
  pageNumber: number = 1;
  pageSize: number = 10;
}
