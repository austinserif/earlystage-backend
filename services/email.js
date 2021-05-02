const Mailgun = require("mailgun-js");


/**
 * Function closure wraps the Mailgun API
 * and defines functions for handling basic
 * mail operations such as `send`.
 */
export default async function () {
    try {

        // fetch api key and sender domain info from env vars
        // rename variables
        const { SENDER_DOMAIN: apiKey, MAILGUN_API_KEY: domain } = process.env;

        // create new instance of a mailgun object
        const mg = Mailgun({ apiKey, domain });

    } catch (err) {

    } finally {

    }
}

class Email {
    static async send(recipient, subject, text) {
        try {
            const data = {
                from: `Mailgun Sandbox <postmaster@${SENDER_DOMAIN}>`,
                to: recipient,
                subject,
                text
            };

            const result = await mg.messages().send(data, function (error, body) {
                if (error) {
                    console.error(error);
                }

                console.log(body);
            });

            return result;

        } catch(err) {
            
        }
    }
}

module.exports = Email;