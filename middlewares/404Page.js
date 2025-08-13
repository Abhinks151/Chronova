import httpStatusCode  from "../utils/httpStatusCode.js";
import { logger } from "../config/logger.js";


const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  logger.error(error);
  res.status(httpStatusCode.NOT_FOUND.code).render('Layouts/404');
};

export default notFoundHandler;
