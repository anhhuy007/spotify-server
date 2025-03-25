import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function successResponse(success, message, data) {
    // if using pagination, add the pagination object to the response
    if (data && typeof data === 'object' && 'page' in data && 'limit' in data && 'total' in data) {
        const pagination = {
            total: data.total,
            limit: data.limit,
            page: data.page,
            totalPages: Math.ceil(data.total / data.limit),
        };

        const dataRes = {
            pagination, 
            items: data.items
        };

        return {
            success,
            message, 
            data: dataRes
        }
    }   

    // if not using pagination, return the data directly
    return {
        success,
        message,
        data
    }
}

function errorResponse(success, message) {
    return {
        success,
        message
    }
}

function validatePaginationOptions(options) {
    let { page = 1, limit = 10, filter = {} } = options;

    if (typeof page !== 'number') {
        page = parseInt(page);
    }

    if (typeof limit !== 'number') {
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
        sortBy = 'createdAt';
    }

    if (!sortOrder) {
        sortOrder = 'desc';
    }

    return { sortBy, sortOrder };
}

async function sendSubscriptionEmail(email, subscription) {
    console.log("Sending subscription email");
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Subscription Confirmation - Spotify Clone",
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Subscription Confirmation</h2>
                <p>Your subscription to Spotify Clone has been confirmed.</p>
                <p>Subscription Plan: <strong>${subscription.plan}</strong></p>
                <p>Subscription Status: <strong>${subscription.status}</strong></p>
                <p>Thank you for subscribing to Spotify Clone.</p>
                <p>Thank you,<br>Spotify Clone Team</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent");
    } catch (error) {
        console.log(error);
    }
}

export default {
    successResponse,
    errorResponse,
    validatePaginationOptions,
    validateSortOptions,
    sendSubscriptionEmail
}
