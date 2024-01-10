declare namespace Express {
  export interface Request {
    connect: {
      userId: string | null;
      deviceId: string;
      tokenLastActiveDate: string;
    };
  }
}
