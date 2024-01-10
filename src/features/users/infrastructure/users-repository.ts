import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, userDocument } from '../users-schema';
import { UsersQuery } from '../users-query';
import { DataSource } from 'typeorm';
import { UserCreatorToSql } from '../../auth/users-input';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private UsersModel: Model<userDocument>,
    private dataSource: DataSource,
  ) {}
  async createNewUser(newUser: any) {
    return await this.UsersModel.create(newUser);
  }

  async registrationNewUser(user: UserCreatorToSql) {
    await this.dataSource.query(
      `
    INSERT INTO public."Users"(login, email, "passwordHash", "passwordSalt", "createdAt", 
    "confirmationCode", "expirationDate", "isConfirmation", "recoveryCode")

    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [
        user.login,
        user.email,
        user.passwordHash,
        user.passwordSalt,
        user.createdAt,
        user.confirmationCode,
        user.expirationDate,
        user.isConfirmation,
        user.recoveryCode,
      ],
    );
  }

  async checkExistUser(login: string, email: string) {
    return this.dataSource.query(
      `
    SELECT u.*
    FROM public."Users" u 
    WHERE u."login" = $1 or u."email" = $2
    `,
      [login, email],
    );
  }

  async getAllUsers(query: UsersQuery) {
    return this.UsersModel.find({
      $or: [
        {
          'accountData.login': {
            $regex: query.searchLoginTerm ? query.searchLoginTerm : '',
            $options: 'i',
          },
        },
        {
          'accountData.email': {
            $regex: query.searchEmailTerm ? query.searchEmailTerm : '',
            $options: 'i',
          },
        },
      ],
    })
      .sort({
        ['accountData.' + query.sortBy]: query.sortDirection,
      })
      .skip((query.pageNumber - 1) * query.pageSize)
      .limit(query.pageSize)
      .lean();
  }

  async usersCount(query: UsersQuery) {
    return this.UsersModel.countDocuments({
      $or: [
        {
          'accountData.login': {
            $regex: query.searchLoginTerm ? query.searchLoginTerm : '',
            $options: 'i',
          },
        },
        {
          'accountData.email': {
            $regex: query.searchEmailTerm ? query.searchEmailTerm : '',
            $options: 'i',
          },
        },
      ],
    });
  }

  async deleteUserById(id: string) {
    const result = await this.UsersModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  async updateRecoveryCode(email: string, newRecoveryCode: string) {
    await this.dataSource.query(
      `
    UPDATE public."Users"
    SET "recoveryCode"= $2
    WHERE "email" = $1`,
      [email, newRecoveryCode],
    );
  }

  async checkRecoveryCode(recoveryCode: string) {
    return this.dataSource.query(
      `
    SELECT *
    FROM public."Users"
    WHERE "recoveryCode" = $1`,
      [recoveryCode],
    );
  }

  async updatePassword(
    recoveryCode: string,
    passwordHash: string,
    passwordSalt: string,
  ) {
    await this.dataSource.query(
      `
    UPDATE public."Users"
    SET "passwordHash" = $2, "passwordSalt" = $3
    WHERE "recoveryCode" = $1`,
      [recoveryCode, passwordHash, passwordSalt],
    );
  }

  async invalidRecoveryCode(recoveryCode: string) {
    await this.dataSource.query(
      `
    UPDATE public."Users"
    SET "recoveryCode" = 'null'
    WHERE "recoveryCode" = $1;`,
      [recoveryCode],
    );
  }

  async findUserByLoginOrEmail(loginOrEmail: string) {
    const result = await this.dataSource.query(
      `
    SELECT u.*
    FROM public."Users" u 
    WHERE u."login" = $1 or u."email" = $1
    `,
      [loginOrEmail],
    );

    return result.map((e) => {
      return {
        passwordSalt: e.passwordSalt,
        passwordHash: e.passwordHash,
        id: e.id,
      };
    });
  }

  async updateToken(token: string, userId: string) {
    await this.UsersModel.updateOne(
      { _id: userId },
      {
        $set: {
          'token.accessToken': token,
        },
      },
    );
  }

  async checkLoginAndEmail(login: string, email: string) {
    return this.UsersModel.findOne({
      $or: [{ 'accountData.email': email }, { 'accountData.login': login }],
    });
  }

  async getUserById(userId: string | null) {
    return this.dataSource.query(
      `SELECT *
    FROM public."Users"
    WHERE "id" = $1`,
      [userId],
    );
  }

  async getUserByConfirmationCode(code: string) {
    return this.dataSource.query(
      `
    SELECT *
    FROM public."Users"
    WHERE "confirmationCode" = $1`,
      [code],
    );
  }

  async updateConfirmStatus(userId: string) {
    await this.dataSource.query(
      `
    UPDATE public."Users"
    SET "isConfirmation" = 'true', "confirmationCode" = 'null'
    WHERE "id" = $1`,
      [userId],
    );
  }

  async checkUserByEmail(email: string) {
    return this.dataSource.query(
      `
    SELECT *
    FROM public."Users"
    WHERE "email" = $1`,
      [email],
    );
  }

  async updateConfirmCode(userId: string, newConfirmationCode: string) {
    await this.dataSource.query(
      `
    UPDATE public."Users"
    SET "confirmationCode" = $2
    WHERE "id" = $1;`,
      [userId, newConfirmationCode],
    );
  }
}
