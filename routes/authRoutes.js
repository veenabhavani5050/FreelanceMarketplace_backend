const  express=require('express');
const { register, login, logout, me } = require('../controllers/authController');
const {verifyToken}=require('../middlewares/auth') 
const authRouter =express.Router()


authRouter.post('/register',register),
authRouter.post('/login',login),
authRouter.post('/logout',logout),
authRouter.get('/me',verifyToken,me),



module.exports=authRouter;