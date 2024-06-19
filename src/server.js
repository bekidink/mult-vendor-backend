const express=require('express')
const app=express()
const port=process.env.PORT|| 3000;
const dotenv=require('dotenv')
const mongoose=require('mongoose')
const categoryRoute=require('./routes/category')
const restaurantRoute=require('./routes/restaurant')
const foodRoute=require('./routes/restaurant')
dotenv.config();
mongoose.connect(process.env.DB).then(()=>{
console.log("Database Connected")
}).catch((err)=>{
    console.log(err)
})
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use("/api/category",categoryRoute)
app.use("/api/restaurant",restaurantRoute)
app.use("/api/foods",foodRoute)
app.listen(port,()=>console.log(`Foodly backend is running ${port}`))