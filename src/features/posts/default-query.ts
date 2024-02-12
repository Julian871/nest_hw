import { Transform } from 'class-transformer';

export class PostsDefaultQuery {
  @Transform(({ value }) => {
    if (value.toLowerCase() === 'blogid') {
      return 'blog.id';
    } else if (value.toLowerCase() === 'blogname') {
      return 'blog.name';
    } else {
      return value;
    }
  })
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
