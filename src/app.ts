import express from 'express';
import userRouter from './resources/users/user.router';
import session from "express-session";
export const app = express();

app.use('/', (req, res, next) => {
    if (req.originalUrl === '/') {
        res.send('Service is running!');
        return;
    }
    next();
});



app.use('/users',session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000
    }
}), userRouter);


module.exports = { app }