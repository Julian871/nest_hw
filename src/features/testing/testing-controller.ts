import { Controller, Delete, HttpCode } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(private dataSource: DataSource) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteAll() {
    await this.dataSource.query(`
        DELETE FROM public."Users";
        DELETE FROM public."Session";
        DELETE FROM public."Blogs";
        DELETE FROM public."Posts";
        DELETE FROM public."Comments";
        DELETE FROM public."PostLikes";
        DELETE FROM public."CommentLikes";
    `);
  }
}
