import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../../entities/comment-entity';
import { PostsDefaultQuery } from '../../posts/default-query';

@Injectable()
export class CommentsQueryRepo {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async getAllCommentsToPost(query: PostsDefaultQuery, postId: number) {
    return this.commentsRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.owner', 'owner')
      .where(`c.postId = :postId`, { postId })
      .orderBy(`c.${query.sortBy}`, query.sortDirection)
      .skip((query.pageNumber - 1) * query.pageSize)
      .take(query.pageSize)
      .getMany();
  }
}
