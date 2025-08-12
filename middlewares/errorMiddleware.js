import { logger } from "../config/logger.js";
import httpStatusCode  from "../utils/httpStatusCode.js";

const errorHandler = (err, req, res, next) => {
  console.error(err);
  logger.error(err);
  res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).render("Layouts/error", {
    statusCode: httpStatusCode.INTERNAL_SERVER_ERROR.code,
    message: "Internal Server Error",
    description: "Something went wrong. Please try again later.",
  });
};




export default errorHandler;