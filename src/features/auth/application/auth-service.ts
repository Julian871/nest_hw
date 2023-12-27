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
    const accessToken = await this.jwtService.signAsync(
      { userId: userId },
      { secret: process.env.JWT_SECRET_ACCESS, expiresIn: '10m' },
    );
    await this.usersService.updateToken(accessToken, userId);
    return accessToken;
  }

  async createRefreshToken(userId: string, deviceId: string) {
    return this.jwtService.signAsync(
      { userId: userId, deviceId: deviceId },
      { secret: process.env.JWT_SECRET_REFRESH, expiresIn: '20s' },
    );
  }

  async getUserIdFromAccessToken(token: string) {
    try {
      const result: any = this.jwtService.verify(token.split(' ')[1], {
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

  async getDeviceIdRefreshToken(token: string) {
    try {
      const result: any = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_REFRESH,
      });
      return result.deviceId;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
