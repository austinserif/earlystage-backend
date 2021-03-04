const getConnection = require('./connect');
const ExpressError = require('../helpers/ExpressError');
const { ObjectID } = require('bson');
const { updateCollection } = require('../helpers/updateCollection');

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

            //TODO: UPDATE THIS CODE BLOCK

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

            const { ops } = result;
            const res = ops[0];



            //add workspace id of new object to user's workspace array
            const addedToUser = await db.collection('users').updateOne(
                { email: { $eq: email } },
                { $push: { 'workspaces': result.ops[0]._id }}
            );

            return res;

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

            const result = await updateCollection('workspaces', updates, workspaceId, db);
            
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
     * 
     * @param {String} workspaceId
     * @param {String} email
     */
    static async getById(workspaceId, email) {
        const [ db, client ] = await getConnection();
        try {
            const query = { _id: { $eq: new ObjectID(workspaceId) } };
            const cursor = await db.collection('workspaces').find(query); // find workspace associated with a given id
            const [ result ] = await cursor.toArray();

            if (!result) throw new ExpressError('No workspace was found for the give id', 404);

            const { userEmail } = result;

            if (userEmail === email) {
                return result;
            } else {
                throw new ExpressError('Unauthorized: you can only view your own workspaces', 401);
            }
        } catch(err) {
            throw new ExpressError(err.message, err.status || 500);
        } finally {
            client.close();
        }
    }

    static async getAllWorkspaceData(workspaceId, email) {
        const [db, client] = await getConnection(); // initializes the database connection
        try {
            const _id = new ObjectID(workspaceId); // generates object id from string
            const cursor = await db.collection('workspaces').find({ _id: { $eq: _id } }); // executes query
            const [ result ] = await cursor.toArray();

            if (!result) throw new ExpressError('Either the workspaceId or email are undefined', 404);

            const { userEmail, components } = result; // extracts userEmail for verification and components for later

            // checks that this user is allowed to access this piece
            if (userEmail !== email) {
                // throws error if not allowed here
                throw new ExpressError('Unauthorized: you can only view your own workspaces', 401);
            };

            // queries component collection for any item whose _id is contained in the passed array
            const componentsCursor = await db.collection('components').find({
                _id: {
                    $in: [
                        ...components
                    ]
                }
            });

            const componentArray = await componentsCursor.toArray(); // converts second cursor object to an array
            return componentArray; // returns the array


        } catch(err) {
            // handles errors
            throw new ExpressError(err.message, err.status || 500);
        } finally {
            // closes client
            client.close();
        }
    }

    static async delete(workspaceId, email) {
        const [ db, client ] = await getConnection();
        try {
            //will throw error if not authorized
            await Workspace.getById(workspaceId, email);

            const encodedWorkspaceId = new ObjectID(workspaceId);

            const result = await db.collection('workspaces').removeOne({_id: encodedWorkspaceId});

            await db.collection('users').updateOne(
                { email: {$eq: email} },
                { $pull: { workspaces: encodedWorkspaceId} }
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