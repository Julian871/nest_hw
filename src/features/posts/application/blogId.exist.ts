import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { BlogsRepository } from '../../blogs/infrastructure/blogs-repository';

@ValidatorConstraint({ name: 'isBlogExist', async: true })
@Injectable()
export class IsBlogExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async validate(blogId: string) {
    const validObjectId = Types.ObjectId.isValid(blogId);
    if (!validObjectId) return false;

    const blog = await this.blogsRepository.countBlogsByBlogId(blogId);
    console.log('point 1');

    if (blog === 0) {
      return false;
    }

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
