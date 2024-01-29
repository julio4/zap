import { Response, NextFunction } from "express";

import { PrivateKey } from "o1js";

import { signResponse } from "@zap/source";
import {
  SupportedValue,
  ZapResponse,
  ZapSignedResponse,
} from "@zap/types";
import { ZapRequestExpress } from "../types.js";

// This zap middleware will transform the response from ZapResponseExpress to Response<ZapSignedResponse>
export const zapMiddleware = (
  req: ZapRequestExpress,
  res: Response,
  next: NextFunction
) => {
  const originalJson = res.json.bind(res);

  // Override the json method
  res.json = (body: SupportedValue): Response<ZapSignedResponse> => {
    const requestPath = req.baseUrl + req.path;

    if (!body && body !== 0) {
      throw new Error("Invalid response body for path: " + requestPath);
    }

    const response: ZapResponse = {
      value: body,
      route: {
        path: requestPath,
        args: req.body.args,
      },
    };

    // Load the private key of our account from an environment variable
    const privateKey = PrivateKey.fromBase58(process.env["PRIVATE_KEY"] || "");
    if (!privateKey) {
      throw new Error("Source key incorrect. Please contact source operator.");
    }

    const signedResponse = signResponse(response, privateKey);

    // Call the original json method with the signed response
    return originalJson(signedResponse) as Response<ZapSignedResponse>;
  };

  next();
};
