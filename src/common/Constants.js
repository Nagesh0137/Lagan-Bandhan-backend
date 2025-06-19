const JWTScreatKey = 'Vaibhav@123#123';
const JWTAdminScreatKey = 'VaibhavAdmin@123#123';

// RazorPay Configuration
const RazorpayKeyId = 'rzp_live_RVVSDnjM9ShqQ3'; // Your live Razorpay key
const RazorpayKeySecreat = 'PMUcJ6F23QIilqf5cqmcumcc'; // Your live Razorpay secret

const subscriptionAmount = 251;
const frontendPaymentRedirectURL = 'http://localhost:3000/auth';
const skipPayment = false; // Set to true to skip payment validation for development

module.exports = {
  JWTScreatKey,
  JWTAdminScreatKey,
  RazorpayKeyId,
  RazorpayKeySecreat,
  subscriptionAmount,
  frontendPaymentRedirectURL,
  skipPayment,
};