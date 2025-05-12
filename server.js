// const mongoose =require('mongoose');
// const app = require('./app')

// mongoose.connect(MONGOODB_URL)
// .then(()=>{
// console.log('MongoDB connected successfully');
// // start application server
// app.listen(3001,'127.0.0.1',()=>{
//  console.log('Server is running at http://127.0.0.1:3001');
// })
// })
// .catch((err)=>{
// console.log(`MongoDB connection failed: ${err.message}`);
// })


const mongoose = require('mongoose');
const app = require('./app');
const { MONGODB_URL } = require('./utils/config'); 

mongoose.connect(MONGODB_URL)
.then(() => {
  console.log('MongoDB connected successfully');

  app.listen(3001, '127.0.0.1', () => {
    console.log('Server is running at http://127.0.0.1:3001');
  });
})
.catch((err) => {
  console.error(`MongoDB connection failed: ${err.message}`);
});
