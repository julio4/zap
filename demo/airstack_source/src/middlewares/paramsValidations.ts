import { Request, Response, NextFunction } from "express";
import {
  body,
  validationResult,
  FieldValidationError,
} from "express-validator";
import { SupportedValue, ZapRequestParams } from "@zap/types";

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
  .withMessage("args.id is required")
  .isInt()
  .withMessage("args.id must be an integer");

export const ethereumAddressArg = body("args.address")
  .notEmpty()
  .withMessage("args.address is required")
  .isEthereumAddress()
  .withMessage("args.address must be a valid ethereum address");

export const ethereumSignatureArg = body("args.signature")
  .notEmpty()
  .withMessage("args.signature is required")
  .isLength({ min: 132, max: 132 })
  .withMessage("args.signature must be a valid ethereum message signature");

export const erc20AddressArg = body("args.token")
  .notEmpty()
  .withMessage("args.token is required")
  .isEthereumAddress()
  .withMessage("args.token must be a valid ethereum address");

export const nftAddressArg = body("args.nftAddress")
  .notEmpty()
  .withMessage("args.nftAddress is required")
  .isEthereumAddress()
  .withMessage("args.nftAddress must be a valid ethereum address");

export const blockchainArg = body("args.blockchain")
  .notEmpty()
  .withMessage("args.blockchain is required")
  .isIn(["ethereum", "polygon", "base"])
  .withMessage("args.blockchain must be a supported blockchain");

export const poapIdArg = body("args.poapId")
  .notEmpty()
  .withMessage("args.poapId is required")
  .isNumeric()
  .withMessage("args.poapId must be a valid poap id");
