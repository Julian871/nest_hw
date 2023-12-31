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
    await this.dataSource.query(`
INSERT INTO public."Users"(login, email, "passwordHash", "passwordSalt", "createdAt", 
"confirmationCode", "expirationDate", "isConfirmation", "recoveryCode")

VALUES ('${user.login}', '${user.email}', '${user.passwordHash}', '${user.passwordSalt}', 
'${user.createdAt}', '${user.confirmationCode}', '${user.expirationDate}',
'${user.isConfirmation}', '${user.recoveryCode}');`);
  }

  async checkExistUser(login: string, email: string) {
    return this.dataSource.query(`SELECT u.*
    FROM public."Users" u 
    
    WHERE u."login" = '${login}' or u."email" = '${email}'
    `);
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
    await this.UsersModel.updateOne(
      { 'accountData.email': email },
      { $set: { recoveryCode: newRecoveryCode } },
    );
  }

  async checkRecoveryCode(recoveryCode: string) {
    return this.UsersModel.findOne({ recoveryCode: recoveryCode });
  }

  async updatePassword(
    recoveryCode: string,
    passwordHash: string,
    passwordSalt: string,
  ) {
    return this.UsersModel.updateOne(
      { recoveryCode: recoveryCode },
      {
        $set: {
          'accountData.passwordHash': passwordHash,
          'accountData.passwordSalt': passwordSalt,
        },
      },
    );
  }

  async invalidRecoveryCode(recoveryCode: string) {
    await this.UsersModel.updateOne(
      { recoveryCode: recoveryCode },
      { $set: { recoveryCode: null } },
    );
  }

  async findUserByLoginOrEmail(loginOrEmail: string) {
    const result = await this.dataSource.query(`SELECT u.*
    FROM public."Users" u 
    
    WHERE u."login" = '${loginOrEmail}' or u."email" = '${loginOrEmail}'
    `);

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
    return this.UsersModel.findOne({ _id: userId });
  }

  async getUserByConfirmationCode(code: string) {
    return this.UsersModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
  }

  async updateConfirmStatus(userId: string) {
    await this.UsersModel.updateOne(
      { _id: userId },
      {
        $set: {
          'emailConfirmation.isConfirmation': true,
        },
      },
    );
  }

  async checkUserByEmail(email: string) {
    return this.UsersModel.findOne({ 'accountData.email': email });
  }

  async updateConfirmCode(userId: string, newConfirmationCode: string) {
    await this.UsersModel.updateOne(
      { _id: userId },
      {
        $set: {
          'emailConfirmation.confirmationCode': newConfirmationCode,
        },
      },
    );
  }
}
