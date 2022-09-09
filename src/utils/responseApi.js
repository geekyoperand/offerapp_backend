/**
 * @desc    Send any success response
 *
 * @param   {string} message
 * @param   {object | array} results
 * @param   {number} statusCode
 */
exports.success = (messageCode, data, statusCode) => {
  return {
    messageCode,
    message: messageCode,
    success: true,
    code: statusCode,
    data,
  };
};

/**
 * @desc    Send any error response
 *
 * @param   {string} message
 * @param   {object} data
 * @param   {number} statusCode
 */
exports.error = (messageCode, data, statusCode) => {
  // List of common HTTP request code
  const codes = [200, 201, 400, 401, 404, 403, 422, 500];

  // Get matched code
  const findCode = codes.find((code) => code === statusCode);

  return {
    messageCode,
    message: messageCode,
    code: !findCode ? 500 : findCode,
    success: false,
    data,
  };
};

/**
 * @desc    Send any validation response
 *
 * @param   {object | array} errors
 */
exports.validation = (errors) => {
  return {
    message: 'Validation errors',
    success: false,
    code: 422,
    errors,
  };
};
