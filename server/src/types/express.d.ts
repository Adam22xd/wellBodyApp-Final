declare namespace Express {
  interface Request {
    user?: {
      firebaseUid: string;
      email?: string;
    };
  }
}
