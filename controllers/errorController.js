const AppError = require("../utils/AppError");


const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    // 400: Bad request
    return new AppError(message, 400); // It will return AppError which is Error ( === new Error)
}

const handleDuplicateFieldsDB = err => {
    // Extract the email address from the error message
    const emailRegex = /email: "([^"]+)"/;
    const match = err.message.match(emailRegex);
    const email = match ? match[1] : null;

    // Create an error message with the duplicated email
    const message = email ? `Duplicate field value: ${email}. Please try another value!` : 'Unknown duplicate field error.';
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message); // put all validation eerror messages in one error string message 
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleJWTError = () => {
    return new AppError('Invalid token, Please log in again!', 401);
}

const handleJWTExpiredError = () => {
    return new AppError('Your token has expired! Please log in again.', 401); // 401 => error code
}


const sendErrorDev = (err, req, res) => {
    // A) API
    console.log(req.originalUrl);
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }
};

const sendErrorProd = (err, req, res) => {
    // A) API
    console.log(req.originalUrl);
    if (req.originalUrl.startsWith('/api')) {
        // A) Operational, trusted error: send message to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        // B) Programming or other unknown error: don't leak error details
        // 1) Log error
        console.error('ERROR 💥', err);
        // 2) Send generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
};


module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';


    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        error.message = err.message;
        // مش عارفين ليش م اخدش المسج زي م اخد الكود ف مانيولي عملناها 
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
        sendErrorProd(error, req, res);

    }

}