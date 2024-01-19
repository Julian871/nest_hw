export class CommentInformation {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  };

  constructor(
    id: number,
    content: string,
    userId: number,
    userLogin: string,
    createdAt: Date,
    likesCount: number,
    dislikesCount: number,
    myStatus: string,
  ) {
    this.id = id.toString();
    this.content = content;
    this.commentatorInfo = {
      userId: userId.toString(),
      userLogin: userLogin,
    };
    this.createdAt = createdAt.toISOString();
    this.likesInfo = {
      likesCount: likesCount,
      dislikesCount: dislikesCount,
      myStatus: myStatus,
    };
  }
}
