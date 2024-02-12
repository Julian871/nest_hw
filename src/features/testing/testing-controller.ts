import { Controller, Delete, HttpCode } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(private dataSource: DataSource) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteAll() {
    await this.dataSource.query(`
      TRUNCATE TABLE public."Users", public."Session", public."Blogs", 
      public."Posts", public."Comments", public."PostLikes", public."CommentLikes";
    `);
  }
}
