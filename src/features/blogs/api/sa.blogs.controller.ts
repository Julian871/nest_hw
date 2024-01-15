import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BlogsQuery } from '../blogs-query';
import { Request as Re, Response } from 'express';
import { BlogsDefaultQuery } from '../default-query';
import { BasicAuthGuard } from '../../../security/auth-guard';
import { CreateBlogInputModel, UpdateBlogInputModel } from './blogs-dto-models';
import { CreatePostForBlogInputModel } from '../../posts/api/posts-models';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/use-cases/create-blog-use-case';
import { CreatePostToBlogCommand } from '../application/use-cases/create-post-to-blog-use-case';
import { GetBlogsCommand } from '../application/use-cases/get-blogs-use-case';
import { GetBlogByIdCommand } from '../application/use-cases/get-blog-by-id-use-case';
import { GetPostsToBlogCommand } from '../application/use-cases/get-posts-to-blog-use-case';
import { UpdateBlogCommand } from '../application/use-cases/update-blog-use-case';
import { DeleteBLogCommand } from '../application/use-cases/delete-blog-use-case';
import { AuthService } from '../../../security/auth-service';

@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class SaBlogsController {
  constructor(
    private commandBus: CommandBus,
    private authService: AuthService,
  ) {}

  @Post()
  @HttpCode(201)
  async createBlog(@Body() dto: CreateBlogInputModel) {
    return await this.commandBus.execute(new CreateBlogCommand(dto));
  }

  @Post(':id/posts')
  async createPostToBlog(
    @Body() dto: CreatePostForBlogInputModel,
    @Res({ passthrough: true }) res: Response,
    @Param('id') blogId: string,
  ) {
    const post = await this.commandBus.execute(
      new CreatePostToBlogCommand(blogId, dto),
    );
    if (!post) {
      res.status(HttpStatus.NOT_FOUND);
    } else res.status(HttpStatus.CREATED).send(post);
  }

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

  @Put('/:id')
  async updateBlog(
    @Param('id') blogId: string,
    @Body() dto: UpdateBlogInputModel,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isUpdate = await this.commandBus.execute(
      new UpdateBlogCommand(blogId, dto),
    );
    if (!isUpdate) {
      res.status(HttpStatus.NOT_FOUND);
    } else res.status(HttpStatus.NO_CONTENT);
  }

  @Delete('/:id')
  async deleteBlog(
    @Param('id') blogId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isDelete = await this.commandBus.execute(
      new DeleteBLogCommand(blogId),
    );
    if (!isDelete) {
      res.status(HttpStatus.NOT_FOUND);
    } else res.status(HttpStatus.NO_CONTENT);
  }
}
