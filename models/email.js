const { send } = require('../services/email');

class Email {
    static async sendCreateAccountLink (email) {
        try {
            // build unique URL

            // build message body

            // build subject line

            // send email
        } catch (err) {
            // handle errors
        }
    };
    static async sendResetPasswordLink () {};
}