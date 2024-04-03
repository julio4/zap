import { type Request, type Response } from 'express'

export type ZapResponseExpress = Response<SupportedTargetValue>

// The ZapMiddleware will transform the ZapResponseExpress into Response<ZapSignedResponse>
export type ZapRequestExpress = Request<any, ZapResponse, ZapRequestParams>
