declare namespace Express {
  export interface Request {
    connect: {
      userId: number | null;
      deviceId: string | null;
      tokenLastActiveDate: string;
    };
  }
}
