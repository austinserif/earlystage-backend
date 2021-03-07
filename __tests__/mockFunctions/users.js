/**
 * Returns an Object containing a suite of functions for mocking user
 * @returns {Object}
 */
const mock = (function() {
    let count = 0;
    const buildPassword = () => new String(Math.floor(Math.random() * 10000));
    const buildName = () => new String(`Test User${count}`);
    const buildEmail = () => new String(`testUser${count}@gmail.com`);

    return {
        /**
         * returns an object with properties
         * -> {name, email, password} representing a fake user
         */
        createFakeUser() {
            count++; // iterate count
            return {
                name: buildName(),
                email: buildEmail(),
                password: buildPassword()
            }
        },
        /**
         * Returns the number of generated users
         */
        getCount() {
            return count;
        }
    }
})();

module.exports = mock;