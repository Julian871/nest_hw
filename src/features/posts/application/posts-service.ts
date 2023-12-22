import { PostsRepository } from '../infrastructure/posts-repository';
import { PostsDefaultQuery } from '../default-query';
import { Injectable } from '@nestjs/common';
import { PostInformation } from './posts-output';
import { PageInformation } from '../../page-information';
import { PostCreator } from './posts-input';
import { CommentCreator } from '../../comments/application/comments-input';
import { CommentInformation } from '../../comments/application/comments-output';

@Injectable()
export class PostsService {
  constructor(private readonly postsRepository: PostsRepository) {}

  async createNewPost(data: any) {
    const newPost = new PostCreator(
      data.title,
      data.shortDescription,
      data.content,
      data.blogId,
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

  async createNewPostComment(postId: string, data: any) {
    const newComment = new CommentCreator(
      data.content,
      'userId',
      'userlogin',
      postId,
    );
    const comment = await this.postsRepository.createNewPostComment(newComment);
    return new CommentInformation(
      comment._id.toString(),
      data.content,
      'userId',
      'userLogin',
      comment.createdAt,
      0,
      0,
      'None',
    );
  }

  async getAllPosts(query: PostsDefaultQuery) {
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
            'None',
            [],
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

  async getPostById(id: string) {
    const post = await this.postsRepository.getPostById(id);
    if (!post) {
      return null;
    }
    return new PostInformation(
      id,
      post.title,
      post.shortDescription,
      post.content,
      post.blogId,
      post.blogName,
      post.createdAt,
      post.extendedLikesInfo.countLike,
      post.extendedLikesInfo.countDislike,
      'None',
      [],
    );
  }

  async getAllPostsComments(query: PostsDefaultQuery, postId: string) {
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
            postId,
            p.content,
            'userId',
            p.commentatorInfo.userLogin,
            p.createdAt,
            p.likesInfo.countLike,
            p.likesInfo.countDislike,
            'None',
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
