import { PostsRepository } from '../../infrastructure/posts-repository';
import { LikesCommentsService } from '../../../likes/likes-comment-service';
import { PostsDefaultQuery } from '../../default-query';
import { CommentInformation } from '../../../comments/application/comments-output';
import { PageInformation } from '../../../page-information';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class GetAllPostCommentCommand {
  constructor(
    public query: PostsDefaultQuery,
    public postId: string,
  ) {}
}

@CommandHandler(GetAllPostCommentCommand)
export class GetAllPostCommentUseCase
  implements ICommandHandler<GetAllPostCommentCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly likesCommentsService: LikesCommentsService,
  ) {}

  async execute(command: GetAllPostCommentCommand) {
    const isFindPost = await this.postsRepository.getPostById(command.postId);
    if (!isFindPost) return false;
    const countPostsComments = await this.postsRepository.countPostsComments(
      command.postId,
    );
    const allPostsComments = await this.postsRepository.getAllPostsComments(
      command.query,
      command.postId,
    );
    const filterPostsComments = await Promise.all(
      allPostsComments.map(
        async (p) =>
          new CommentInformation(
            p._id.toString(),
            p.content,
            p.commentatorInfo.userId,
            p.commentatorInfo.userLogin,
            p.createdAt,
            p.likesInfo.countLike,
            p.likesInfo.countDislike,
            await this.likesCommentsService.getMyStatus(
              p._id.toString(),
              p.commentatorInfo.userId,
            ),
          ),
      ),
    );

    return new PageInformation(
      command.query.pageNumber,
      command.query.pageSize,
      countPostsComments,
      filterPostsComments,
    );
  }
}
