const HttpStatus = {
  OK: { code: 200, message: "OK" },
  CREATED: { code: 201, message: "Created" },
  NO_CONTENT: { code: 204, message: "No Content" },

  BAD_REQUEST: { code: 400, message: "Bad Request" },
  UNAUTHORIZED: { code: 401, message: "Unauthorized" },
  FORBIDDEN: { code: 403, message: "Forbidden" },
  NOT_FOUND: { code: 404, message: "Not Found" },
  CONFLICT: { code: 409, message: "Conflict" },

  INTERNAL_SERVER_ERROR: { code: 500, message: "Internal Server Error" },
  SERVICE_UNAVAILABLE: { code: 503, message: "Service Unavailable" },
};

export default HttpStatus;


