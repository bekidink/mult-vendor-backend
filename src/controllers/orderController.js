const Order=require('../models/Order')
module.exports={
    placeOrder:async(req,res)=>{
        console.log(req.body)
        const newOrder=new Order({
            ...req.body,
            userId:req.user.id
        })
        try {
            await newOrder.save()
            const orderId=newOrder._id.toString()
            res.status(200).json({status:true,message:"successfully ordered",orderId:orderId})
        } catch (error) {
            console.log(error)
            res.status(500).json({status:false,message:error.message})
        }
    },
    getUserOrders:async(req,res)=>{
        const userId=req.user.id;
        const{paymentStatus,orderStatus}=req.query;
        let query={userId};
        if(paymentStatus){
            query.paymentStatus=paymentStatus
        }
        if(orderStatus){
            query.orderStatus=orderStatus
        }
        try {
            const orders=await Order.find(query)
            .populate({
                path:'orderItems.foodId',
                select:'imageUrl title rating time'
            })
         res.status(200).json(orders)
        } catch (error) {
            res.status(500).json({status:false,message:error.message})
        }
    }
}