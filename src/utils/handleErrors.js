class GenericResponseError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function throwError(message, code = 400) {
  throw new GenericResponseError(code, message);
}
handleCastErrorExceptionForInvalidObjectId = () => throwError('Invalid Parameter. Resource Not Found');

isCastError = (error = '') => error.toString().indexOf('CastError') !== -1;

module.exports = {
  throwError,
  isCastError,
  handleCastErrorExceptionForInvalidObjectId
};
