import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from '../../../entities/blog-entity';

@Injectable()
export class BlogsRepo {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
  ) {}

  saveBlog(blog: Blog) {
    return this.blogsRepository.save(blog);
  }

  getBlogById(blogId: number) {
    return this.blogsRepository.findOneBy({ id: blogId });
  }

  async deleteBlogById(blogId: number) {
    const result = await this.blogsRepository.delete({ id: blogId });
    return result.affected;
  }
}
