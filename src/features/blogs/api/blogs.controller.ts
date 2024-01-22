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
    const blog = await this.commandBus.execute(new GetBlogByIdCommand(+blogId));
    res.status(HttpStatus.OK).send(blog);
  }

  @Get('/:id/posts')
  async getPostsToBlog(
    @Param('id') blogId: string,
    @Query() query: BlogsDefaultQuery,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Re,
  ) {
    let userId: number | null;
    if (req.cookies.refreshToken) {
      userId = await this.authService.getUserIdFromRefreshToken(
        req.cookies.refreshToken,
      );
    } else if (req.headers.authorization) {
      userId = await this.authService.getUserIdFromAccessToken(
        req.headers.authorization!,
      );
    } else {
      userId = null;
    }

    const postsList = await this.commandBus.execute(
      new GetPostsToBlogCommand(query, +blogId, userId),
    );
    res.status(HttpStatus.OK).send(postsList);
  }
}
