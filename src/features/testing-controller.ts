import { Controller, Delete, HttpCode } from '@nestjs/common';
import { UsersRepository } from './users/infrastructure/users-repository';
import { BlogsRepository } from './blogs/infrastructure/blogs-repository';
import { PostsRepository } from './posts/infrastructure/posts-repository';
import { CommentsRepository } from './comments/infrastructure/comments-repository';
import { ConnectRepository } from './connect/connect-repository';

@Controller('testing')
export class TestingController {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly bLogRepository: BlogsRepository,
    private readonly postRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly connectRepository: ConnectRepository,
  ) {}
  @Delete('/all-data')
  @HttpCode(204)
  async deleteAll() {
    await this.userRepository.deleteAllCollection();
    await this.bLogRepository.deleteAllCollection();
    await this.postRepository.deleteAllCollection();
    await this.commentsRepository.deleteAllCollection();
    await this.connectRepository.deleteAllCollection();
  }
}
