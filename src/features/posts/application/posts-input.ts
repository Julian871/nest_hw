export class PostCreator {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  createdAt: string;
  blogName: string;

  constructor(
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
  ) {
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
    this.blogId = blogId;
    this.createdAt = new Date().toISOString();
    this.blogName = blogName;
  }
}
