import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConnectCreator } from '../devices/session/session-input';
import { Connection, connectionDocument } from './connection-schema';

@Injectable()
export class ConnectionRepository {
  constructor(
    @InjectModel(Connection.name)
    private ConnectionModel: Model<connectionDocument>,
  ) {}

  async countConnection(IP: string, URL: string) {
    const limitDate = new Date(+new Date() - 10000);
    return this.ConnectionModel.countDocuments({
      IP: IP,
      URL: URL,
      lastActiveDate: { $gt: limitDate },
    });
  }

  async createConnectionInfo(connectInformation: Connection) {
    await this.ConnectionModel.create(connectInformation);
  }

  async deleteAllCollection() {
    await this.ConnectionModel.deleteMany();
  }
}
