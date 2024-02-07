import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogsQuery } from '../blogs-query';
import { Blog } from '../../../entities/blog-entity';

@Injectable()
export class BlogsQueryRepo {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
  ) {}

  async getAllBlogs(query: BlogsQuery) {
    return this.blogsRepository
      .createQueryBuilder('b')
      .where(`b.name ILIKE :searchLoginTerm`, {
        searchLoginTerm: `%${query.searchNameTerm}%`,
      })
      .orderBy(`b.${query.sortBy}`, query.sortDirection)
      .skip((query.pageNumber - 1) * query.pageSize)
      .take(query.pageSize)
      .getMany();
  }

  async getCountAllBlogs(query: BlogsQuery) {
    return this.blogsRepository
      .createQueryBuilder('b')
      .where(`b.name ILIKE :searchLoginTerm`, {
        searchLoginTerm: `%${query.searchNameTerm}%`,
      })
      .orderBy(`b.${query.sortBy}`, query.sortDirection)
      .skip((query.pageNumber - 1) * query.pageSize)
      .take(query.pageSize)
      .getCount();
  }
}
