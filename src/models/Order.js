const mongoose=require('mongoose')
const orderItemSchema=new mongoose.Schema({
    foodId:{type:mongoose.Schema.Types.ObjectId,ref:'Food',required:true},
    quantity:{type:Number,default:1},
    price:{type:Number,required:true},
    additives:{type:Array},
    instructions:{type:String,default:''}
});
const OrderSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    orderItems:[orderItemSchema],
    orderTotal:{type:Number,required:true},
    deliveryFee:{type:Number,required:true},
    grandTotal:{type:Number,required:true},
    deliveryAddress:{
        // type:String,default:'Pending'
        type:mongoose.Schema.Types.ObjectId,ref:'Address',
    },
    restaurantAddress:{
        type:String,require:true
    },
    paymentMethod:{type:String,default:'Pending'},
    paymentStatus:{type:String,default:'Pending',enum:["Pending","Completed","Failed"]},
    orderStatus:{type:String,default:'Placed',enum:["Placed","Accepted","Preparing","Manual","On the way","Delivered","Cancelled","Ready","Out_for_Delivery"]},
    restaurantId:{ type:mongoose.Schema.Types.ObjectId,ref:'Restaurant'},
    restaurantCoords:[Number],
    recipientCoords:[Number],
    driverId:{type:String,default:''},
    rating:{type:Number,min:1,max:5,default:3},
    feedback:{type:String,default:''},
    promoCode:{type:String,default:''},
    discountAmount:{type:Number,default:1},
    notes:{type:String,default:''}
},{timestamps:true})
module.exports=mongoose.model('Order',OrderSchema)