import { PostsRepository } from '../infrastructure/posts-repository';
import { PostsDefaultQuery } from '../default-query';
import { Injectable } from '@nestjs/common';
import { PostInformation } from './posts-output';
import { PageInformation } from '../../page-information';
import { PostCreator } from './posts-input';
import { CommentCreator } from '../../comments/application/comments-input';
import { CommentInformation } from '../../comments/application/comments-output';
import { LikesPostService } from '../../likes/likes-post-service';
import { UsersRepository } from '../../users/infrastructure/users-repository';
import { LikesCommentsService } from '../../likes/likes-comment-service';
import { CreatePostInputModel } from '../posts-models';
import { BlogsRepository } from '../../blogs/infrastructure/blogs-repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly likesPostService: LikesPostService,
    private readonly usersRepository: UsersRepository,
    private readonly likesCommentsService: LikesCommentsService,
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async createNewPost(dto: CreatePostInputModel) {
    const blog = await this.blogsRepository.getBlogById(dto.blogId);
    console.log('blog', blog);
    const newPost = new PostCreator(
      dto.title,
      dto.shortDescription,
      dto.content,
      dto.blogId,
    );
    const post = await this.postsRepository.createNewPost(newPost);

    return new PostInformation(
      post._id.toString(),
      newPost.title,
      newPost.shortDescription,
      newPost.content,
      newPost.blogId,
      post.blogName,
      post.createdAt,
      0,
      0,
      'None',
      [],
    );
  }

  async createNewPostComment(postId: string, content: string, userId: string) {
    const checkPost = await this.postsRepository.getPostById(postId);
    if (!checkPost) return false;
    const user = await this.usersRepository.getUserById(userId);
    const newComment = new CommentCreator(
      content,
      userId,
      user!.accountData.login,
      postId,
    );
    const comment = await this.postsRepository.createNewPostComment(newComment);
    return new CommentInformation(
      comment._id.toString(),
      content,
      userId,
      comment.commentatorInfo.userLogin,
      comment.createdAt,
      0,
      0,
      'None',
    );
  }

  async getAllPosts(query: PostsDefaultQuery, userId: string | null) {
    const countPosts = await this.postsRepository.countPosts();
    const allPosts = await this.postsRepository.getAllPosts(query);
    const filterPosts = await Promise.all(
      allPosts.map(
        async (p) =>
          new PostInformation(
            p._id.toString(),
            p.title,
            p.shortDescription,
            p.content,
            p.blogId,
            p.blogName,
            p.createdAt,
            p.extendedLikesInfo.countLike,
            p.extendedLikesInfo.countDislike,
            await this.likesPostService.getMyStatusToPost(
              p._id.toString(),
              userId,
            ),
            await this.likesPostService.getLikeListToPost(p._id.toString()),
          ),
      ),
    );
    return new PageInformation(
      query.pageNumber,
      query.pageSize,
      countPosts,
      filterPosts,
    );
  }

  async getPostById(postId: string, userId: string) {
    const post = await this.postsRepository.getPostById(postId);
    if (!post) {
      return null;
    }
    return new PostInformation(
      postId,
      post.title,
      post.shortDescription,
      post.content,
      post.blogId,
      post.blogName,
      post.createdAt,
      post.extendedLikesInfo.countLike,
      post.extendedLikesInfo.countDislike,
      await this.likesPostService.getMyStatusToPost(postId, userId),
      await this.likesPostService.getLikeListToPost(postId),
    );
  }

  async getAllPostsComments(query: PostsDefaultQuery, postId: string) {
    const isFindPost = await this.postsRepository.getPostById(postId);
    if (!isFindPost) return false;
    const countPostsComments =
      await this.postsRepository.countPostsComments(postId);
    const allPostsComments = await this.postsRepository.getAllPostsComments(
      query,
      postId,
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
      query.pageNumber,
      query.pageSize,
      countPostsComments,
      filterPostsComments,
    );
  }

  async updatePostById(id: string, data: any) {
    return this.postsRepository.updatePostById(id, data);
  }

  async deletePostById(id: string) {
    return this.postsRepository.deletePostById(id);
  }
}
