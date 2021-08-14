// Core Dependencies
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Custom Dependencies
require('./src/db/mongoose').db().then();

// Routers
const baseRouter = require('./src/router');
const userRouter = require('./src/router/userRouter');
const pageRouter = require('./src/router/pageRouter');
const channelRouter = require('./src/router/channelRouter');
const postRouter = require('./src/router/postRouter');
const adminRouter = require('./src/router/adminRouter');
const reportRouter = require('./src/router/reportRouter');
const commentRouter = require('./src/router/commentRouter');

// App Init
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ credentials: true, origin: '*' }));
app.use(morgan('tiny'));

// Router Middleware
app.use('/', baseRouter);
app.use('/api/user', userRouter);
app.use('/api/user/page/', pageRouter);
app.use('/api/user/channel/', channelRouter)
app.use('/api/post', postRouter);
app.use('/api/report', reportRouter);
app.use('/api/comment', commentRouter);

module.exports = app;
