const { createUserDocument, createWorkspaceDocument } = require('../helpers/createDocument');

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
            let wids = [];
            let qids = [];

            let token = null;

            let hasUid = false;
            let uid;

            count++; // iterate count -- should execute before the bulid functions are called below (to make sure count starts at 1)

            let name = buildName();
            let email = buildEmail();
            let password = buildPassword();

            
            return {
                name,
                email,
                password,
                setToken(_token) {
                    token = _token;
                },
                getToken() {
                    return token;
                },
                clearToken() {
                    token = null;
                },
                setUid(myUid) {
                    if (!hasUid) {
                        uid = myUid;
                        uids.push(uid);
                        hasUid = true;                        
                    }
                },
                createFakeWorkspace(name, domain) {
                    const fakeDocument = createWorkspaceDocument({ email, name, domain });
                    return fakeDocument;
                },
                createFakeUserDocument() {
                    const fakeDocument = createUserDocument({ name, email, password, isAdmin: false, verificationCode: 1234 })
                    return fakeDocument;
                },
                setWid(id) {
                    wids.push(id);
                },
                getWids() {
                    return wids;
                },
                setQid(id) {
                    qids.push(id);
                },
                getQids() {
                    return qids;
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
        },
        async collectionInsert(db, collectionName, document) {
            try {
                const result = await db.collection(collectionName).insertOne(document);
                return result.insertedId;
            } finally {}
        }
    }
})();

module.exports = mock;