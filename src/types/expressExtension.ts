import Parameters from "@util/parameters";

declare global {
  namespace Express {
    interface Request {
      parameters: Parameters<any>;
      user: any;
    }
  }
}
