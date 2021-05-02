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
             * Sends an email from 
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

                    // 
                    const result = await mg.messages().send(data, function (error, body) {
                        if (error) {
                            throw new Error(error);
                        }

                        console.log(body);
                    });

                    // return result of the message-send request
                    return result;

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