const emailServices = require('../services/email');
const databaseOps = require('../services/mongodb/databaseOps');
const ExpressError = require('../helpers/ExpressError');

class Email {
    static async sendCreateAccountLink (email) {
        try {
            // establish connection with database client
            const usersOps = await databaseOps('users');

            // query database for account associated with the passed email
            // getPage returns an array, but since we are looking or a single item
            // we assign the variable `account` to the element at 0th array index
            const [ account ] = await usersOps.getPage({ email });

            // if account is undefined, then build url and send email
            if (account === undefined) {
                // get send function from email services layer
                const { send } = emailServices();

                const subject = 'Fininsh Creating your Earlystaged Due Diligence Account!';

                const text = 'Go to https://earlystaged.io';

                // define message configuration object
                const messageConfig = {
                    recipient: email,
                    subject,
                    text
                };

                const response = await send();

                return response;
            } else if (account.account.isVerified === false) {
                // re-send email
                // possibly display a message?

                // get send function from email services layer
                const { send } = emailServices();

                const subject = 'Fininsh Creating your Earlystaged Due Diligence Account!';

                const text = 'Go to https://earlystaged.io';

                // define message configuration object
                const messageConfig = {
                    recipient: email,
                    subject,
                    text
                };

                const response = await send();

                return response;
                
            } else if (account.account.isVerified === true) {
                // throw an error 
                throw new ExpressError('A user is already registered with this email!');
            }

        } catch (err) {
            throw new ExpressError(err.message, err.status || 500);
        }
    };
    static async sendResetPasswordLink () {};
}