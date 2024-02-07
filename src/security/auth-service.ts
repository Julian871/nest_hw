import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  async createAccessToken(userId: number) {
    return this.jwtService.sign(
      { userId: userId },
      { secret: process.env.JWT_SECRET_ACCESS, expiresIn: '300s' },
    );
  }

  async createRefreshToken(userId: number, deviceId: string) {
    return this.jwtService.sign(
      { userId: userId, deviceId: deviceId },
      { secret: process.env.JWT_SECRET_REFRESH, expiresIn: '20s' },
    );
  }

  async getUserIdFromAccessToken(token: string) {
    try {
      const result: any = this.jwtService.verify(token.split(' ')[1], {
        secret: process.env.JWT_SECRET_ACCESS,
      });
      return result.userId;
    } catch (error) {
      return null;
    }
  }

  async getUserIdFromRefreshToken(token: string) {
    try {
      const result: any = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_REFRESH,
      });
      return result.userId;
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
      return null;
    }
  }

  async getLastActiveDateRefreshToken(token: string) {
    const result: any = this.jwtService.decode(token);

    return new Date(result.iat * 1000).toISOString();
  }
}
