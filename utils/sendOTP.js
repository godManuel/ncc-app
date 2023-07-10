import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

// Declaring env variables in constants
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Initialize a twilio client
const client = twilio(accountSid, authToken);

// A SendOTP promise-based function
const sendOTP = async (options) => {
  client.messages
    .create({
      body: options.body,
      from: process.env.TWILIO_MOBILE,
      to: options.phone,
    })
    .then((message) => console.log(message.sid));
};

export default sendOTP;
