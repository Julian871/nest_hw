import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { BlogsQuery } from '../blogs-query';
import { Request as Re, Response } from 'express';
import { BlogsDefaultQuery } from '../default-query';
import { CommandBus } from '@nestjs/cqrs';
import { GetBlogsCommand } from '../application/use-cases/get-blogs-use-case';
import { GetBlogByIdCommand } from '../application/use-cases/get-blog-by-id-use-case';
import { GetPostsToBlogCommand } from '../application/use-cases/get-posts-to-blog-use-case';
import { AuthService } from '../../../security/auth-service';

@Controller('blogs')
export class BlogsController {
  constructor(
    private commandBus: CommandBus,
    private authService: AuthService,
  ) {}

  @Get()
  async getBlogs(@Query() query: BlogsQuery) {
    return await this.commandBus.execute(new GetBlogsCommand(query));
  }

  @Get('/:id')
  async getBlog(
    @Param('id') blogId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const blog = await this.commandBus.execute(new GetBlogByIdCommand(blogId));
    if (!blog) {
      res.status(HttpStatus.NOT_FOUND);
    } else res.status(HttpStatus.OK).send(blog);
  }

  @Get('/:id/posts')
  async getPostsToBlog(
    @Param('id') blogId: string,
    @Query() query: BlogsDefaultQuery,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Re,
  ) {
    let userId: string | null;
    if (!req.cookies.refreshToken) {
      userId = null;
    } else {
      userId = await this.authService.getUserIdFromRefreshToken(
        req.cookies.refreshToken,
      );
    }

    const postsList = await this.commandBus.execute(
      new GetPostsToBlogCommand(query, blogId, userId),
    );
    if (!postsList) {
      res.status(HttpStatus.NOT_FOUND);
    } else res.status(HttpStatus.OK).send(postsList);
  }
}
