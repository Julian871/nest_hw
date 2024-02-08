import { Controller, Delete, HttpCode } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { User } from '../../entities/user-entity';
import { Blog } from '../../entities/blog-entity';
import { Comment } from '../../entities/comment-entity';
import { CommentLike } from '../../entities/comment-like-entity';
import { PostLike } from '../../entities/post-like-entity';
import { Post } from '../../entities/post-entity';
import { Session } from '../../entities/session-entity';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteAll() {
    await this.entityManager.delete(Comment, {});
    await this.entityManager.delete(CommentLike, {});
    await this.entityManager.delete(PostLike, {});
    await this.entityManager.delete(Post, {});
    await this.entityManager.delete(Session, {});
    await this.entityManager.delete(Blog, {});
    await this.entityManager.delete(User, {});
  }
}
