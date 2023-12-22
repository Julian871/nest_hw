import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/application/users-service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  async createAccessToken(userId: string) {
    const accessToken = this.jwtService.sign(
      { userId: userId },
      { secret: process.env.JWT_SECRET_ACCESS, expiresIn: '600s' },
    );
    await this.usersService.updateToken(accessToken, userId);
    return accessToken;
  }

  async createRefreshToken(userId: string, deviceId: string) {
    return this.jwtService.sign(
      { userId: userId, deviceId: deviceId },
      { secret: process.env.JWT_SECRET_REFRESH, expiresIn: '20s' },
    );
  }

  async getUserIdFromAccessToken(token: string) {
    try {
      const result: any = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_ACCESS,
      });
      return result.userId.toString();
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getUserIdFromRefreshToken(token: string) {
    try {
      const result: any = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_REFRESH,
      });
      return result.userId.toString();
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
