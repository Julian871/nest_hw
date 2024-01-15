export class PageInformation {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: object;

  constructor(
    page: number,
    pageSize: number,
    totalCount: number,
    items: object,
  ) {
    this.pagesCount = Math.max(Math.ceil(totalCount / pageSize), 1);
    this.page = +page;
    this.pageSize = +pageSize;
    this.totalCount = +totalCount;
    this.items = items;
  }
}
