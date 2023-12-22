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
    id: string,
    content: string,
    userId: string,
    userLogin: string,
    createdAt: string,
    likesCount: number,
    dislikesCount: number,
    myStatus: string,
  ) {
    this.id = id;
    this.content = content;
    this.commentatorInfo = {
      userId: userId,
      userLogin: userLogin,
    };
    this.createdAt = createdAt;
    this.likesInfo = {
      likesCount: likesCount,
      dislikesCount: dislikesCount,
      myStatus: myStatus,
    };
  }
}
