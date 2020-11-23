/** 
 * Takes a new user object with basic information, and fits it into 
 * a json schema that includes other necessary fields for later on in 
 * the userflow
 */
const createUserDocument = ({ name, email, password }) => {
    const now = new Date();
    return {
        email,
        account: {
            name,
            password
        },
        workspaces: {},
        questions: {},
        metadata: {
            lastModified: now,
            createdDate: now
        }
    }
}

module.exports = createUserDocument;
