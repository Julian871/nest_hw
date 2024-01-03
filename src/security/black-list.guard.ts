import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersRepository } from '../features/users/infrastructure/users-repository';

@Injectable()
export class BlackListGuard implements CanActivate {
  constructor(private readonly usersRepository: UsersRepository) {}

  async canActivate(context: ExecutionContext) {
    const req: Request = context.switchToHttp().getRequest();
    const check = await this.usersRepository.checkToken(
      req.cookies.refreshToken,
    );
    if (check === null) return true;

    throw new UnauthorizedException();
  }
}
