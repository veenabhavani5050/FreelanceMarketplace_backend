const { JWT_SECRET } = require("../utils/config");
const jwt = require ('jsonwebtoken')

const auth ={
verifyToken:(req,res,next)=>{
const token = req.cookies.token || req.headers ['authorization'];

if(!token){
return res.status(401).json({message:'No token provided'});
}

// verify the token
const decodedToken =jwt.verify(token,JWT_SECRET);

if(!decodedToken){
return res.status(401).json({message:'Invalid token '});
}
// attach user to request
req.userId =decodedToken.id;

next();
},
}
module.exports = auth;