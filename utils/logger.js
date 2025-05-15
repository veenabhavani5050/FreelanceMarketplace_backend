const logger = async (req,res,next)=>{
console.log(`Request Mothod ${req.method}`);
console.log(`Request URL ${req.url}`);
console.log(`Request Header ${JSON.stringify(req.headers)}`);
console.log(`Request body ${JSON.stringify(req.body)}`);
console.log(`Request params ${JSON.stringify(req.params)}`);
console.log(`Request query ${JSON.stringify(req.query)}`);
// console.log(`Request cookies ${JSON.cookies(req.cookies)}`);
console.log(`Request cookies: ${JSON.stringify(req.cookies)}`);
console.log(`Request time ${new Date().toDateString()}`);
console.log('--------------------------------------');
next();

}

module.exports =logger;