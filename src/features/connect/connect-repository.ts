import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Connect, connectDocument } from './connect-schema';
import { ConnectCreator } from './connect-input';

@Injectable()
export class ConnectRepository {
  constructor(
    @InjectModel(Connect.name) private ConnectModel: Model<connectDocument>,
  ) {}

  async countConnection(IP: string, URL: string) {
    const limitDate = new Date(+new Date() - 10000);
    return this.ConnectModel.countDocuments({
      IP: IP,
      URL: URL,
      lastActiveDate: { $gt: limitDate },
    });
  }

  async createConnectionInfo(connectInformation: ConnectCreator) {
    await this.ConnectModel.create(connectInformation);
  }

  async updateUserId(userId: string, deviceId: string) {
    await this.ConnectModel.updateMany(
      { deviceId: deviceId },
      { $set: { userId: userId } },
    );
  }

  async deleteAllCollection() {
    await this.ConnectModel.deleteMany();
  }
}
