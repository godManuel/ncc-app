import dotenv from "dotenv";
dotenv.config();
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

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
