import { Request, Response, NextFunction } from "express";
import {
  body,
  validationResult,
  FieldValidationError,
} from "express-validator";
import { SupportedValue, ZapRequestParams } from "@packages/zap-utils/types";

export const validateParams = (
  req: Request<ZapRequestParams>,
  res: Response<SupportedValue>,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(
      new Error(
        "Validation error:\n" +
          errors
            .formatWith(
              (error) =>
                "- " +
                (error.type === "field"
                  ? ` (${(error as FieldValidationError).path} with value '${
                      (error as FieldValidationError).value
                    }'):`
                  : "") +
                " " +
                error.msg
            )
            .array()
            .join("\n")
      )
    );
  }
  next();
};

export const validationErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.message.startsWith("Validation error")) {
    res.status(400).send(err.message);
  } else {
    next(err);
  }
};

export const minaAddress = body("mina_address")
  .notEmpty()
  .withMessage("mina_address is required")
  .isLength({ min: 55, max: 55 })
  .withMessage("mina_address must be a valid mina address")
  .custom((addr) => addr.startsWith("B62"))
  .withMessage("mina_address must be a valid mina address");

export const idArg = body("args.id")
  .notEmpty()
  .withMessage("arg.id is required")
  .isInt()
  .withMessage("arg.id must be an integer");

export const ethereumAddressArg = body("args.address")
  .notEmpty()
  .withMessage("arg.address is required")
  .isEthereumAddress()
  .withMessage("arg.address must be a valid ethereum address");

export const ethereumSignatureArg = body("args.signature")
  .notEmpty()
  .withMessage("arg.signature is required")
  .isLength({ min: 132, max: 132 })
  .withMessage("arg.signature must be a valid ethereum message signature");

export const erc20AddressArg = body("args.token")
  .notEmpty()
  .withMessage("arg.token is required")
  .isEthereumAddress()
  .withMessage("arg.token must be a valid ethereum address");

export const blockchainArg = body("args.blockchain")
  .notEmpty()
  .withMessage("arg.blockchain is required")
  .isIn(["ethereum", "polygon", "base"])
  .withMessage("arg.blockchain must be a supported blockchain");
