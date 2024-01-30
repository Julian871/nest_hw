export class UsersQuery {
  searchLoginTerm: string = '';
  searchEmailTerm: string = '';
  sortBy: string = 'createdAt';
  sortDirection: 'DESC' | 'ASC' = 'DESC';
  pageNumber: number = 1;
  pageSize: number = 10;
}
