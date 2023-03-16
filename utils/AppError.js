class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
        this.isOperational = true;
        // If the error has isOperational property: Operational error, trusted error: send message to the client
        // If not: Programming or other unkown error: don't leak error details
        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = AppError;