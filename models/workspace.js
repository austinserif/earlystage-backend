const getConnection = require('./connect');
const ExpressError = require('../helpers/ExpressError');
const { ObjectID } = require('bson');

class Workspace {

    /** takes an email and a workspace object, 
     * and creates a new workspace if the workspace's name
     * is not already taken
     */


     //NOTE: CHANGE THIS INTO A COMPOUND QUERY
    static async new(email, workspace) {
        const [ db, client ] = await getConnection();
        try {
            const { name, domain } = workspace;

            const now = new Date();

            // insert new workspace in workspace collection
            const result = await db.collection('workspaces').insertOne({ 
                userEmail: email,
                entity: {
                    name,
                    domain
                },
                components: [],
                metadata: {
                    lastModified: now,
                    createdDate: now
                }
            });

            //add workspace id of new object to user's workspace array
            const addedToUser = await db.collection('users').updateOne(
                { email: { $eq: email } },
                { $push: { 'workspaces': result.ops[0]._id }}
            );

            return addedToUser;

        } catch(err) {
            throw new ExpressError(err.message, err.status || 500)
        }
        finally {
            client.close();
        }
    }

    /** 
     * Accepts an email and updates array as args
     */
    static async update (workspaceId, email, updates) {
        const [ db, client ] = await getConnection();
        try {

            //will throw error if user does not match workspace id
            await Workspace.getById(workspaceId, email);

            //map changes into updates object
            const updatesObj = {};
            updates.forEach(o => (updatesObj[o.field] = o.value));

            //update workspace and get result
            const result = await db.collection('workspaces')
                .updateOne(
                    {
                        _id: new ObjectID(workspaceId)
                    },
                    {
                        $set: {
                            ...updatesObj, 
                            'metadata.lastModified': new Date()
                        }
                    }
                );

            const { matchedCount, modifiedCount } = result;


            if ( !matchedCount || !modifiedCount ) {
                throw new ExpressError('Resource either could not be found, or could not be updated, or both', 404)
            }
            
            return result;

        } catch(err) {
            throw new ExpressError(err.message, err.status || 500);
        }

        finally {
            client.close();
        }
    }

    /** takes a workspace id and email and returns object if database contains 
     * an object corresponding to the given id that also contains an email property value
     * matching the email argument.
     */
    static async getById(workspaceId, email) {
        const [ db, client ] = await getConnection();
        try {
            const cursor = await db.collection('workspaces').find(workspaceId);
            const [ result ] = await cursor.toArray();
            const { userEmail } = result;

            if (userEmail === email) {
                return result;
            } else {
                throw new ExpressError('Unauthorized: you can only view your own workspaces', 401);
            }
        } catch(err) {
            throw new ExpressError(err.message, err.status || 500);
        }

        finally {
            client.close();
        }
    }

    static async delete(workspaceId, email) {
        const [ db, client ] = await getConnection();
        try {
            //will throw error if not authorized
            await Workspace.getById(workspaceId, email);

            const result = await db.collection('workspaces').removeOne({_id: new ObjectID(workspaceId)});

            await db.collection('users').updateOne(
                {email},
                { $pull: { workspaces: workspaceId}}
            );

            //return result
            return result;

        } catch(err) {
            throw new ExpressError(err.message, err.status || 500);
        }

        finally {
            client.close();
        }
    }
}

module.exports = Workspace;