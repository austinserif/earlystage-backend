const { send } = require('../services/email');

class Email {
    static async sendCreateAccountLink (email) {
        try {
            // check email against database

            // if email is associated with an active account, throw an error

            // if email is associated with an unfinished registration generate a url and send email

            // if email is unique and valid, generate a url and send email

        } catch (err) {
            // handle errors
        }
    };
    static async sendResetPasswordLink () {};
}