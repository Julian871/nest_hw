import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { AuthService } from './auth-service';
import { ConnectionRepository } from '../features/connection/connection-repository';
import { multerExceptions } from '@nestjs/platform-express/multer/multer/multer.constants';

@Injectable()
export class ConnectGuard implements CanActivate {
  constructor(private readonly connectionRepository: ConnectionRepository) {}

  async canActivate(context: ExecutionContext) {
    const req: Request = context.switchToHttp().getRequest();
    const URL = req.originalUrl;
    const IP = req.ip ?? 'hacker';
    const lastActiveDate = new Date();
    await this.connectionRepository.createConnectionInfo({
      URL,
      IP,
      lastActiveDate,
    });
    const countConnection = await this.connectionRepository.countConnection(
      IP,
      URL,
    );
    if (countConnection > 5) {
      return false;
    }
    return true;
  }
}
