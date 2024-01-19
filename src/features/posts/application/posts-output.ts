export class PostInformation {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
    newestLikes: any;
  };

  constructor(
    id: number,
    title: string,
    shortDescription: string,
    content: string,
    blogId: number,
    blogName: string,
    createdAt: Date,
    likesCount: number,
    dislikesCount: number,
    myStatus: string,
    newestLikes: any,
  ) {
    this.id = id.toString();
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
    this.blogId = blogId.toString();
    this.blogName = blogName;
    this.createdAt = createdAt.toISOString();
    this.extendedLikesInfo = {
      likesCount: likesCount,
      dislikesCount: dislikesCount,
      myStatus: myStatus,
      newestLikes: newestLikes,
    };
  }
}
