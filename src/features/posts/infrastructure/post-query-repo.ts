import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../post-entity';
import { PostsDefaultQuery } from '../default-query';
import { PostLike } from '../../likes/post-like-entity';
import { BlogsDefaultQuery } from '../../blogs/default-query';

@Injectable()
export class PostsQueryRepo {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private readonly postsLikeRepository: Repository<PostLike>,
  ) {}

  async getAllPosts(query: PostsDefaultQuery) {
    return this.postsRepository
      .createQueryBuilder('p')
      .orderBy(`p.${query.sortBy}`, query.sortDirection)
      .skip((query.pageNumber - 1) * query.pageSize)
      .take(query.pageSize)
      .getMany();
  }

  async getListLike(postId: number) {
    return this.postsLikeRepository
      .createQueryBuilder('l')
      .where(`l.postId = :postId AND l.status = 'Like'`, { postId })
      .orderBy(`l.addedAt`, 'DESC')
      .limit(3)
      .getMany();
  }

  async getPostToBlog(query: BlogsDefaultQuery, blogId: number) {
    return await this.postsRepository
      .createQueryBuilder('p')
      .where('p.blogId = :blogId', { blogId })
      .orderBy(`p.${query.sortBy}`, query.sortDirection)
      .skip((query.pageNumber - 1) * query.pageSize)
      .take(query.pageSize)
      .getMany();
  }
}
