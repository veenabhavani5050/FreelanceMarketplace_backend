const errorRoute =(req,res)=>{
    res.status(404).json({message:'Router is not found'})
}
module.exports=errorRoute;