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

  async getDeviceList(userId: string) {
    const session = await this.ConnectModel.find({ userId }).lean();
    return session;
  }

  async findDeviceId(deviceId: string) {
    return this.ConnectModel.findOne({ deviceId: deviceId });
  }

  async deleteByDeviceId(deviceId: string) {
    await this.ConnectModel.deleteMany({ deviceId: deviceId });
  }

  async deleteUserSession(userId: string | null, deviceId: string) {
    await this.ConnectModel.deleteMany({
      userId: userId,
      deviceId: { $not: { $regex: deviceId } },
    });
  }

  async updateConnectDate(deviceId: string) {
    await this.ConnectModel.updateOne(
      { deviceId: deviceId },
      { $set: { lastActiveDate: +new Date() } },
    );
  }
}
