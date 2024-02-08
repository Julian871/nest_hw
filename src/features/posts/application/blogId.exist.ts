import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsRepo } from '../../blogs/infrastructure/blogs-repo';

@ValidatorConstraint({ name: 'isBlogExist', async: true })
@Injectable()
export class IsBlogExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepo: BlogsRepo) {}
  async validate(blogId: string) {
    const blog = await this.blogsRepo.getBlogById(+blogId);
    if (!blog) return false;
    return true;
  }
}

export const isBlogExist =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBlogExistConstraint,
    });
  };
