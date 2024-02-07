import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user-entity';
import { UsersQuery } from '../api/users-query';

@Injectable()
export class UsersQueryRepo {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getAllUsers(query: UsersQuery) {
    return this.usersRepository
      .createQueryBuilder('u')
      .where(
        `u.login ILIKE :searchLoginTerm OR u.email ILIKE :searchEmailTerm`,
        {
          searchLoginTerm: `%${query.searchLoginTerm}%`,
          searchEmailTerm: `%${query.searchEmailTerm}%`,
        },
      )
      .orderBy(`u.${query.sortBy}`, query.sortDirection)
      .skip((query.pageNumber - 1) * query.pageSize)
      .take(query.pageSize)
      .getMany();
  }

  async getCountAllUsers(query: UsersQuery) {
    return this.usersRepository
      .createQueryBuilder('u')
      .where(
        `u.login ILIKE :searchLoginTerm OR u.email ILIKE :searchEmailTerm`,
        {
          searchLoginTerm: `%${query.searchLoginTerm}%`,
          searchEmailTerm: `%${query.searchEmailTerm}%`,
        },
      )
      .orderBy(`u.${query.sortBy}`, query.sortDirection)
      .skip((query.pageNumber - 1) * query.pageSize)
      .take(query.pageSize)
      .getCount();
  }

  async getUserByLoginOrEmail(loginOrEmail: string) {
    return this.usersRepository
      .createQueryBuilder('u')
      .where('u.login = :loginOrEmail OR u.email = :loginOrEmail', {
        loginOrEmail,
      })
      .getOne();
  }
}
