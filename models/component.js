const getConnection = require('./connect');
const { createComponentDocument } = require('../helpers/createDocument');
const Workspace = require('./workspace');
const Question = require('./question');
const { updateCollection, updateCollectionArray } = require('../helpers/updateCollection');
const ExpressError = require('../helpers/ExpressError');

class Component {
    /**
     * 
     * @param {String} questionId 
     * @param {String} workspaceId 
     * @param {*} answer 
     */
    static async new(email, questionId, workspaceId, answer) {
        const [ db, client ] = await getConnection();
        try {

            //verify that workspace exists AND belongs to user associated with input email
            await Workspace.getById(workspaceId, email); //if false throw error

            //verify that questionId exists
            const question = await Question.getById(questionId);

            //EVENTUALY INCLUDE LOGIC HERE FOR PASSING A REGEX FOR ANSWER FORMATTING (client and server side)

            //turn inputs into a full component object
            const newComponent = createComponentDocument({questionId, workspaceId, answer});

            //insert document into collection
            const { ops } = await db.collection('components').insertOne(newComponent);

            //destructure result from ops array (there should only be one item in the array)
            const [ result ] = ops;

            await updateCollectionArray('workspaces', 'components', result._id, workspaceId, db);

            //return result
            return result;

        } catch(err) {
            throw new ExpressError(err.message, err.status || 500);
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
            //find requested component and return result from cursor
            const cursor = await db.collection('components').find(componentId);
            const [ result ] = await cursor.toArray();

            //throw error if id doesn't yield anything
            if (!result) {
                throw new ExpressError('No component was found corresponding to the given componentId', 404);
            }

            //throw error if component object retrieved, but not associated with selected workspace
            if (result.workspaceId !== workspaceId) {
                throw new ExpressError('Unauthorized: The requested component does not belong to the users workspace', 401);
            }

            //return result
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
    static async update(workspaceId, componentId, email, updates) {
        const [ db, client ] = await getConnection();
        try {
            //verify that workspace and email are properly related
            await Workspace.getById(workspaceId, email);

            //verify componentId and workspaceId are properly related
            await Component.getById(workspaceId, componentId);

            //attempts to update colleciton and store result, otherwise throws an erro
            const result = await updateCollection('components', updates, componentId, db);

            //return result
            return result;

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