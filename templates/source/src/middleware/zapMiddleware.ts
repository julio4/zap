import { Request, Response, NextFunction } from "express";

import { PrivateKey } from "o1js";

import { ZapRequestParams, ZapResponse, ZapSignedResponse } from "../types";
import { signResponse } from "../helpers";

// This zap middleware will hash the route, 
export const zapMiddleware = (
  req: Request<ZapRequestParams>,
  res: Response,
  next: NextFunction
) => {
  const originalJson = res.json.bind(res);

  // Override the json method
  res.json = (
    body: ZapResponse
  ): Response<ZapSignedResponse, Record<string, any>> => {
    if (!body || !body.value || !body.route) {
      throw new Error("Invalid response body for path: " + req.path);
    }

    // Load the private key of our account from an environment variable
    const privateKey = PrivateKey.fromBase58(process.env["PRIVATE_KEY"] || "");
    if (!privateKey) {
      throw new Error("Source key incorrect. Please contact source operator.");
    }

    const signedResponse = signResponse(body, req.params, privateKey);

    // Call the original json method with the signed response
    return originalJson(signedResponse);
  };

  next();
};
