const Razorpay = require('razorpay');
const {
  RazorpayKeyId,
  RazorpayKeySecreat,
  subscriptionAmount,
  frontendPaymentRedirectURL,
  JWTScreatKey,
} = require('../common/Constants');
const { ErrorResponse } = require('../helper/response');
const { errorMessage } = require('../common/StatusCodes');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: RazorpayKeyId,
  key_secret: RazorpayKeySecreat,
});

const makePayment = async (req, res) => {
  console.log('makePayment called');
  try {
    const { transactionId, userId } = req.body;

    const options = {
      amount: subscriptionAmount * 100, // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: transactionId,
      payment_capture: 1, // auto capture payment
      notes: {
        userId: userId,
        transactionId: transactionId
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      key: RazorpayKeyId
    });

  } catch (error) {
    console.error('Error in makePayment:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
};

const verifyPayemt = async (req, res) => {
  try {
    const { payment_id, order_id, userId } = req.query;

    // Verify payment with Razorpay
    const payment = await razorpay.payments.fetch(payment_id);

    if (payment.status === 'captured') {
      verifyPaymentSuccess({
        userId,
        paymentInfo: {
          success: true,
          code: 'PAYMENT_SUCCESS',
          paymentDetails: payment
        },
        req,
        res
      });
    } else {
      const url = `${frontendPaymentRedirectURL}/fail`;
      return res.redirect(url);
    }
  } catch (error) {
    console.error('Error in verifyPayemt:', error);
    const url = `${frontendPaymentRedirectURL}/fail`;
    return res.redirect(url);
  }
};

const verifyPaymentSuccess = ({ userId, paymentInfo, req, res }) => {
  const jwtData = {
    userId,
    time: Date(),
  };
  const token = jwt.sign(jwtData, JWTScreatKey);
  User.findOneAndUpdate(
    {
      _id: userId,
    },
    { paymentInfo, token },
    { new: true },
  )
    .then(data => {
      if (data === null) {
        return new ErrorResponse(res, {
          message: errorMessage.USER_NOT_FOUND,
        });
      }
      const redirectUrl = `${frontendPaymentRedirectURL}/validate?token=${data?.token
        }&type=${paymentInfo.code === 'PAYMENT_SUCCESS' ? 1 : 0}`;
      return res.redirect(redirectUrl);
    })
    .catch(error => {
      return new ErrorResponse(res, error.message);
    });
};

module.exports = {
  makePayment,
  verifyPayemt,
};