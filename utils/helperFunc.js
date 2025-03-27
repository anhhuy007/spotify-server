import nodemailer from "nodemailer";
import { differenceInMonths, parseISO } from "date-fns";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function successResponse(success, message, data) {
  // if using pagination, add the pagination object to the response
  if (
    data &&
    typeof data === "object" &&
    "page" in data &&
    "limit" in data &&
    "total" in data
  ) {
    const pagination = {
      total: data.total,
      limit: data.limit,
      page: data.page,
      totalPages: Math.ceil(data.total / data.limit),
    };

    const dataRes = {
      pagination,
      items: data.items,
    };

    return {
      success,
      message,
      data: dataRes,
    };
  }

  // if not using pagination, return the data directly
  return {
    success,
    message,
    data,
  };
}

function errorResponse(success, message) {
  return {
    success,
    message,
  };
}

function validatePaginationOptions(options) {
  let { page = 1, limit = 10, filter = {} } = options;

  if (typeof page !== "number") {
    page = parseInt(page);
  }

  if (typeof limit !== "number") {
    limit = parseInt(limit);
  }

  if (page < 1) {
    page = 1;
  }

  if (limit < 1) {
    limit = 10;
  }

  return { page, limit, filter };
}

function validateSortOptions(options) {
  let { sortBy, sortOrder } = options;

  if (!sortBy) {
    sortBy = "createdAt";
  }

  if (!sortOrder) {
    sortOrder = "desc";
  }

  return { sortBy, sortOrder };
}

async function sendSubscriptionEmail(email, subscription) {
  // enddate - startdate = duration (in months)
  const duration = differenceInMonths(parseISO(subscription.endDate.toISOString()), parseISO(subscription.startDate.toISOString()));

  const html = invoiceTemplate(
    subscription._id,
    email,
    getPlan(subscription.subscriptionType),
    duration,
    subscription.total,
    subscription.total,
    convertTimeStampToDate(subscription.startDate),
    convertTimeStampToDate(subscription.endDate),
    subscription.newCharge
  );

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Subscription Confirmation - Spotify Clone",
    html: html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent");
  } catch (error) {
    console.log(error);
  }
}

function convertTimeStampToDate(timestamp) {
  // convert from 2025-03-17T01:10:36.439Z to March 17, 2025
  const date = new Date(timestamp);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

function invoiceTemplate(
  invoiceId,
  useremail,
  plan,
  duration,
  subtotal,
  total,
  startDate,
  endDate,
  newCharge
) {
  return `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Spotify Premium Invoice</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #F7F7F7;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td align="center" valign="top">
                        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FFFFFF;">
                            <tr>
                                <td style="background-color: #000000; padding: 20px; text-align: center;">
                                    <img src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_White.png" alt="Spotify" style="width: 140px; height: auto;">
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 30px 20px;">
                                    <h2>Thank you for your purchase!</h2>
                                    <p>We're excited to have you as a Premium member. Here's your receipt for your records.</p>
                                    <div style="border: 1px solid #EEEEEE; border-radius: 8px; margin-top: 20px; margin-bottom: 20px; padding: 20px; background-color: #FFFFFF;">
                                        <div style="border-bottom: 1px solid #EEEEEE; padding-bottom: 15px; margin-bottom: 20px;">
                                            <h1 style="font-size: 24px; color: #000000; margin: 0; padding: 0;">Invoice</h1>
                                            <p style="font-size: 14px; color: #666666; margin-top: 5px;">Date: ${startDate}</p>
                                            <p style="font-size: 14px; color: #666666; margin-top: 5px;">Invoice: ${invoiceId}</p>
                                        </div>
                                        <div style="margin-bottom: 30px;">
                                            <h3 style="font-size: 18px; font-weight: bold; color: #000000; margin: 0; padding: 0;">John Doe</h3>
                                            <p style="font-size: 14px; color: #666666; margin-top: 5px;"> ${useremail}</p>
                                        </div>
                                        <div style="margin-bottom: 30px;">
                                            <h4 style="font-size: 16px; font-weight: bold; color: #000000; margin-bottom: 15px;">Subscription Details</h4>
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                    <td align="left" style="font-size: 14px; color: #666666;">Plan:</td>
                                                    <td align="right" style="font-size: 14px; font-weight: bold; color: #000000;">${plan}</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" style="font-size: 14px; color: #666666;">Duration:</td>
                                                    <td align="right" style="font-size: 14px; font-weight: bold; color: #000000;">${duration} months</td>
                                                </tr>
                                            </table>
                                        </div>
                                        <div style="background-color: #F9F9F9; border-radius: 8px; padding: 15px; margin-bottom: 30px;">
                                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                                <tr>
                                                    <td align="left" style="font-size: 14px; color: #666666;">Subtotal:</td>
                                                    <td align="right" style="font-size: 14px; font-weight: bold; color: #000000;">₫${subtotal}</td>
                                                </tr>
                                                <tr>
                                                    <td align="left" style="font-size: 16px; font-weight: bold; color: #000000; border-top: 1px solid #EEEEEE; padding-top: 10px;">Total:</td>
                                                    <td align="right" style="font-size: 16px; font-weight: bold; color: #1DB954; border-top: 1px solid #EEEEEE; padding-top: 10px;">₫${total}</td>
                                                </tr>
                                            </table>
                                        </div>
                                        <p>After your promotional period ends on ${endDate}, you will be charged the standard rate of <u>₫${newCharge}/month</u> unless you cancel.</p>
                                    </div>
                                    <div style="text-align: center; margin: 30px 0;">
                                        <a href="https://www.spotify.com/account/" style="display: inline-block; background-color: #1DB954; color: #FFFFFF; text-decoration: none; font-weight: bold; padding: 12px 30px; border-radius: 30px; font-size: 14px;">Manage Your Subscription</a>
                                    </div>
                                    <p>If you have any questions about your subscription or need help, please visit our <a href="https://support.spotify.com/" style="color: #1DB954; text-decoration: none;">Help Center</a> or contact our support team.</p>
                                    <p>Enjoy your music!</p>
                                    <p>The Spotify Team</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="background-color: #F7F7F7; padding: 20px; text-align: center; color: #666666; font-size: 12px;">
                                    <p>© 2025 Spotify AB</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
    </html>
  `;
}

function getPlan(plan) {
  switch (plan) {
    case "mini":
      return "Mini Plan";
    case "individual":
      return "Individual Plan";
    case "student":
      return "Student Plan";
    default:
      return "Free Plan";
  }
}

export default {
  successResponse,
  errorResponse,
  validatePaginationOptions,
  validateSortOptions,
  sendSubscriptionEmail,
};
