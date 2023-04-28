const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const statusRoutes = require('./routes/statusRoutes');
const userRoutes = require('./routes/userRoutes');
const meRoutes = require('./routes/meRoutes');
const globalErrorHandler = require('./controllers/errorController');


const app = express();
// Add headers before the routes are defined
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Limit requests from same API 
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());


// SECURE WEBSITE 
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({
    //   whitelist: //
}));


// Test Middleware 
app.use((req, res, next) => {
    console.log('Hello from app.js middleware');
    next();
})

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});


// Handle Routes
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/users', userRoutes);
app.use('/api/me', meRoutes);


app.use(globalErrorHandler);

module.exports = app