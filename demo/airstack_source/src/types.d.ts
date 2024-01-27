import { Request, Response } from "express";

export type ZapResponseExpress = Response<SupportedValue>;
// The ZapMiddleware will transform the ZapResponseExpress into Response<ZapSignedResponse>
export type ZapRequestExpress = Request<any, ZapResponse, ZapRequestParams>;
