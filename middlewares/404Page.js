import httpStatusCode  from "../utils/httpStatusCode.js";


const notFoundHandler = (req, res, next) => {
  res.status(httpStatusCode.NOT_FOUND.code).render('Layouts/404');
};

export default notFoundHandler;