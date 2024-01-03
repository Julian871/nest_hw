declare namespace Express {
  export interface Request {
    connect: {
      userId: string | null;
      deviceId: string;
      count: number;
    };
    infoConnect: {
      userId: string | null;
      deviceId: string;
    };
  }
}
