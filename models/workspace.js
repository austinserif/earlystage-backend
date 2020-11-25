const getConnection = require('./connect');

class Workspace {

    /** takes an email and a workspace object, 
     * and creates a new workspace if the workspace's name
     * is not already taken
     */
    static async new(email, workspace) {
        const [ db, client ] = await getConnection();
        try {
            const { companyName, companyDomain } = workspace;

            //insert new workspace in workspace collection

            //add workspace id of new object to user's workspace array

        } catch(err) {
            throw new ExpressError(err.message, err.status || 500)
        }
        finally {
            client.close();
        }
    }
}