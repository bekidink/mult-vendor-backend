const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order'); // Import your Order model
const path = require('path');

router.post('/create-checkout-session', async (req, res) => {
    console.log(req.body);
    const customer = await stripe.customers.create({
        metadata: {
            userId: req.body.userId,
            cart: JSON.stringify(req.body.cartItems)
        }
    });

    const line_items = req.body.cartItems.map((item) => {
        return {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: "This is a test product",
                    metadata: {
                        id: item.id,
                        restaurantId: item.restaurantId
                    }
                },
                unit_amount: item.price * 100,
            },
            quantity: item.quantity,
        };
    });

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            customer: customer.id,
            success_url: `${req.protocol}://${req.get('host')}/api/stripe/checkout-success`,
            cancel_url: `${req.protocol}://${req.get('host')}/api/stripe/cancel`,
        });

        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/checkout-success', (req, res) => {
    res.sendFile(path.join(__dirname, 'success.html'));
});

router.get('/checkout-cancel', (req, res) => {
    res.sendFile(path.join(__dirname, 'cancel.html'));
});

router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = 'whsec_YAVmQVgLo6yqmD0c31IOey3LDdfNTYJc'; // Replace with your webhook secret
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                const customer = await stripe.customers.retrieve(paymentIntent.customer);
                const userId = customer.metadata.userId;
    
                // Update payment status in the database
                await Order.findOneAndUpdate(
                    { userId: userId, paymentStatus: 'Pending' }, // Find the pending order for the user
                    { paymentStatus: 'Completed' }
                );
    
                // Optionally send notification
                const message = {
                    notification: {
                        title: 'Payment Successful',
                        body: `Your payment of ${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()} was successful!`,
                    },
                    token: 'your_firebase_token', // Replace with the user's device token
                };
    
                // Uncomment the following lines to send the notification using Firebase
                // admin.messaging().send(message)
                //   .then(response => {
                //     console.log('Successfully sent message:', response);
                //   })
                //   .catch(error => {
                //     console.log('Error sending message:', error);
                //   });
    
                break;
                case 'checkout.session.completed':
                    const checkoutData=event.data.object;
                    stripe.customers.retrieve(checkoutData.customer).then(async (customer)=>{
                        try {
                            const data=JSON.parse(customer.metadata.cart);
                            const products=data.map((item)=>{
                                return {
                                    name:item.id,
                                    price:item.price,
                                    quantity:item.quantity,
                                    restaurantId:item.restaurantId
                                }
    
                            })
                            const updateOrder=await Order.findByIdAndUpdate(products[0].id,{paymentStatus:'completed'},{new:true})
                             console.log(updateOrder)
    
                        } catch (error) {
                            
                        }
                    })
                    
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    

    res.status(200).send('Received webhook');
});

module.exports = router;
