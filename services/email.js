const Mailgun = require("mailgun-js");
const { SENDER_DOMAIN, MAILGUN_API_KEY } = process.env;
const mg = Mailgun({apiKey: MAILGUN_API_KEY, domain: SENDER_DOMAIN});


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