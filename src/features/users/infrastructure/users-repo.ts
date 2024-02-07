import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user-entity';

@Injectable()
export class UsersRepo {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  saveUser(user: User) {
    return this.usersRepository.save(user);
  }

  checkLogin(login: string) {
    return this.usersRepository.findOneBy({ login });
  }

  checkEmail(email: string) {
    return this.usersRepository.findOneBy({ email });
  }

  checkUser(userId: number) {
    return this.usersRepository.findOneBy({ id: userId });
  }

  checkRecoveryCode(recoveryCode: string) {
    return this.usersRepository.findOneBy({ recoveryCode });
  }

  checkConfirmationCode(confirmationCode: string) {
    return this.usersRepository.findOneBy({ confirmationCode });
  }

  async deleteUserById(userId: number) {
    const result = await this.usersRepository.delete({ id: userId });
    return result.affected;
  }
}
