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
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string,
    likesCount: number,
    dislikesCount: number,
    myStatus: string,
    newestLikes: any,
  ) {
    this.id = id;
    this.title = title;
    this.shortDescription = shortDescription;
    this.content = content;
    this.blogId = blogId;
    this.blogName = blogName;
    this.createdAt = createdAt;
    this.extendedLikesInfo = {
      likesCount: likesCount,
      dislikesCount: dislikesCount,
      myStatus: myStatus,
      newestLikes: newestLikes,
    };
  }
}
