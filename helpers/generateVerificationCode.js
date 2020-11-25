const generateVerificationCode = () => {
    return Math.floor(Math.random() * 100000000);
}

module.exports = generateVerificationCode;