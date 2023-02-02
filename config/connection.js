console.log('IN THE CONNECTION')
 
 const mongoose= require("mongoose")
mongoose.set("strictQuery",true)
mongoose.connect(process.env.DB_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
.then(()=>{
    console.log('connected succesfuly')

}).catch((err)=>{
console.log(err+"no connection");
})