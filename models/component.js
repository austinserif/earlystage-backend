const getConnection = require('./connect');
const { createComponentDocument } = require('../helpers/createDocument');
const Workspace = require('./workspace');
const { ObjectID } = require('bson'); 

class Component {
    /**
     * 
     * @param {String} questionId 
     * @param {String} workspaceId 
     * @param {*} answer 
     */
    static async new(email, workspaceId, questionId, answer) {
        const [ db, client ] = await getConnection();
        try {

            //verify that workspace exists AND belongs to user associated with input email
            await Workspace.getById(workspaceId, email); //if false throw error

            //verify that questionId exists

            //

            //turn inputs into a full component object
            const newComponent = createComponentDocument({questionId, workspaceId, answer});

            //insert document into collection
            const { ops } = await db.collection('components').insertOne(newComponent);

            //destructure result from ops array (there should only be one item in the array)
            const [ result ] = ops;

            //place id into componentId array on the workspaces method
            await db.collection('workspaces').updateOne(
                {_id: {$eq: new ObjectID(workspaceId)}},
                {
                    $push: {
                        "components": result._id
                    }
                }
            );

            //return result
            return result;

        } catch(err) {
            throw new ExpressError(err.message. err.status || 500);
        }

        finally {
            client.close();
        }
    }

    /**
     * 
     * Given a `workspaceId` and `componentId`, return the corresponding component object
     * if it contains a matching workspaceId property.
     * 
     * @param {String} workspaceId 
     * @param {String} componentId 
     */
    static async getById(workspaceId, componentId) {
        const [ db, client ] = await getConnection();
        try {
            // const result = await db.collection('components').find({_id: new ObjectID(componentId)});
            const cursor = await db.collection('components').find(
                { $and: [
                    {_id: new ObjectID(componentId)},
                    {workpsaceId: new ObjectID(workspaceId)}
                ]}  
            );

            const [ result ] = await cursor.toArray();

            return result;

        } catch(err) {
            throw new ExpressError(err.message. err.status || 500);
        }

        finally {
            client.close()
        }
    }

    /**
     * 
     * @param {String} workspaceId 
     * @param {String} componentId 
     * @param {Object} updates 
     * 
     * Given a `workspaceId` string, `componentId` string, and an `updates` object, modify the 
     * corresponding component object to reflect changes proposed by the updates object, so long 
     * as the component object contains a workspaceId property matching the input arg.
     */
    static async update(workspaceId, componentId, updates) {
        const [ db, client ] = await getConnection();
        try {

            //verify componentId and workspaceId are properly related

            //execute updates

            //return confirmation or lack thereof

        } catch(err) {
            //catch error and throw new express error
            throw new ExpressError(err.message, err.status || 500);
        }

        finally {
            client.close();
        }
    }

    static async delete(workspaceId, componentId) {
        const [ db, client ] = await getConnection();
        try {

            //verify workspace and component realtionship

            //execute deletion

            //return confirmation

        } catch(err) {
            throw new ExpressError(err.message, err.status || 500);
        }

        finally {
            client.close();
        }
    }
}


module.exports = Component;