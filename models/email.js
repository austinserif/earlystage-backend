const emailServices = require('../services/email');
const ExpressError = require('../helpers/ExpressError');

class Email {
    static async sendCreateAccountLink ({ email, _id }) {
        try {

            // get send method from email services closure
            const { send } = emailServices();

            // create URL
            const accountVerificationLink = `https://earlystaged.io/complete-sign-up?code=${_id}`

            // define message configuration object
            const messageConfig = {
                recipient: email,
                subject: 'Finish Creating your Earlystaged account!',
                text: `Click this link to finish creating your account: ${accountVerificationLink}`
            };

            const response = await send(messageConfig);

            return response;
        } catch (err) {
            throw new ExpressError(err.message, err.status || 500);
        }
    };
    static async sendResetPasswordLink () {};
}

module.exports = Email;