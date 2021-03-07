/**
 * Returns an Object containing a suite of functions for mocking user
 * @returns {Object}
 */
const mock = (function() {
    let count = 0;
    const uids = [];
    const buildPassword = () => new String(`password${Math.floor(Math.random() * 100)}`);
    const buildName = () => new String(`Test User${count}`);
    const buildEmail = () => new String(`testUser${count}@gmail.com`);

    return {
        /**
         * returns an object with properties
         * -> {name, email, password} representing a fake user
         */
        createFakeUser() {
            let token = null;
            let hasUid = false;
            count++; // iterate count
            return {
                name: buildName(),
                email: buildEmail(),
                password: buildPassword(),
                setToken(_token) {
                    token = _token;
                },
                getToken() {
                    return token;
                },
                clearToken() {
                    token = null;
                },
                setUid(uid) {
                    if (!hasUid) {
                        uids.push(uid);
                        hasUid = true;                        
                    }
                }
            }
        },
        /**
         * Returns the number of generated users
         */
        getCount() {
            return count;
        },
        getUids() {
            return uids;
        }
    }
})();

module.exports = mock;