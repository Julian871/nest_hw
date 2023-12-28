export class CommentCreator {
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  idPost: string;
  createdAt: string;

  constructor(
    content: string,
    userId: string,
    userLogin: string,
    idPost: string,
  ) {
    this.content = content;
    this.commentatorInfo = {
      userId: userId,
      userLogin: userLogin,
    };
    this.idPost = idPost;
    this.createdAt = new Date().toISOString();
  }
}
