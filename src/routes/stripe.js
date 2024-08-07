require('dotenv').config();
const router=require('express').Router();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order=require('../models/Order')
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');




// Endpoint to create a checkout session
router.post('/create-checkout-session', async (req, res) => {
const customer=await stripe.customers.create({
    metadata:{
        userId:req.body.userId,
        cart:JSON.stringify(req.body.cartItems)
    }
})
  
const line_items=req.body.cartItems.map((item)=>{
    return {
        price_data:{
            currency:"usd",
            product_data:{
                name:item.name,
                description:"test of product",
                metadata:{
                    id:item.id,
                    restaurantId:item.restaurantId
                }
            },
            unit_amount:item.price*100,
        },
        quantity:item.quantity
    }
});
const session=await stripe.checkout.sessions.create({
    payment_method_types:["card"],
    phone_number_collection:{
        enabled:false
    },
    line_items:line_items,
    mode:"payment",
    customer:customer.id,
    success_url:'http://192.168.10.23:8000/api/stripe/checkout-success',
    cancel_url:"http://192.168.10.23:8000/api/stripe/cancel"
})
  res.send({url:session.url})
});

// Endpoint for checkout success
router.get('/checkout-success', (req, res) => {
  res.sendFile(path.join(__dirname, 'success.html'));
});

// Endpoint for checkout cancel
router.get('/cancel', (req, res) => {
  res.sendFile(path.join(__dirname, 'cancel.html'));
});

// Endpoint to handle payment
router.post('/create-payment-intent', async (req, res) => {
  const { amount, currency, payment_method } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method,
      confirmation_method: 'manual',
      confirm: true,
    });

    // Save payment information to the database
    const payment = new Payment({
      amount,
      currency,
      paymentMethod: payment_method,
      status: paymentIntent.status,
    });
    await payment.save();

    res.status(200).json({ paymentIntent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to handle Stripe webhooks
router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = 'whsec_YAVmQVgLo6yqmD0c31IOey3LDdfNTYJc'; // Replace with your webhook secret
  let event;
  console.log("webhook")
  console.log('Request Headers:', req.headers);
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      // Send notification
      const message = {
        notification: {
          title: 'Payment Successful',
          body: `Your payment of ${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()} was successful!`,
        },
        token: 'your_firebase_token', // Replace with the user's device token
      };

      
      break;
      case 'checkout.session.completed':
        const checkoutData=event.data.object
        stripe.customers.retrieve(checkoutData).then(async (customer)=>{
            try {
                const data=JSON.parse(customer.metadata.cart)
                const products=data.map((item)=>{
                    return {
                        name:item.name,
                        id:item.id,
                        price:item.price,
                        quantity:item.quantity,
                        restaurantId:item.restaurantId
                    }
                })
                const updateOrder=await Order.findByIdAndUpdate(products[0].id,{paymentStatus:'Completed',orderStatus:"Placed"},{new:true})
                console.log(updateOrder)
                if(updateOrder){
                    await updateOrder.save()
                }
            } catch (error) {
                
            }
        })
        break;
    // Add other event types if needed
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).send('Received webhook');
});

module.exports=router
