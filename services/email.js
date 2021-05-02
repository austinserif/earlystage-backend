const Mailgun = require("mailgun-js");

/**
 * Function closure wraps the Mailgun API
 * and defines functions for handling basic
 * mail operations such as `send`.
 */
export default async function () {
    try {

        // get api keys from environment vars and rename
        const { SENDER_DOMAIN: apiKey, MAILGUN_API_KEY: domain } = process.env;

        // create new instance of a mailgun object
        const mg = Mailgun({ apiKey, domain });

        // begin return object with function definitions
        return {
            /**
             * Sends an email from postmaster email url to a specified `recipient`;
             * message contains `subject` line and `text` body values that are passed
             * as args.
             * 
             * @param {String} recipient email url of recipient
             * @param {String} subject subject line
             * @param {String} text email body
             */
            send: async function (recipient, subject, text) {
                try {

                    // defines key data fields for out going message
                    const data = {
                        from: `Mailgun Sandbox <postmaster@${SENDER_DOMAIN}>`,
                        to: recipient,
                        subject,
                        text
                    };

                    // executes request to send message via the mailgun API
                    await mg.messages().send(data, function (error, body) {
                        // stamps identifier on error message
                        if (error) {
                            throw new Error(`ERROR THROWN WHILE SENDING MESSAGE: ${error.message}`);
                        }
                    });

                } catch(err) {
                    // handle errors
                    throw new Error(err);
                }
            }
        }
    } catch (err) {
        // handle errors with setting up email
        throw new Error(err);
    }
}