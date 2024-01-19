import { Controller, Delete, HttpCode } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(private dataSource: DataSource) {}

  @Delete('all-data')
  @HttpCode(204)
  async deleteAll() {
    await this.dataSource.query(`DELETE FROM public."Users"`);
    await this.dataSource.query(`DELETE FROM public."Session"`);
    await this.dataSource.query(`DELETE FROM public."Blogs"`);
    await this.dataSource.query(`DELETE FROM public."Posts"`);
    await this.dataSource.query(`DELETE FROM public."Comments"`);
    await this.dataSource.query(`DELETE FROM public."PostLikes"`);
    await this.dataSource.query(`DELETE FROM public."CommentLikes"`);
  }
}
