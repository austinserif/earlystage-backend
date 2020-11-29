const getConnection = require('./connect');
const { createQuestionDocument, createPresetQuestionDocument } = require('../helpers/createDocument');
const ExpressError = require('../helpers/ExpressError');
const User = require('./user')
const { updateCollectionArray } = require('../helpers/updateCollection');


class Question {

    /**
     * Given a questionId, return corresponding question object or throw error
     * 
     * @param {String} questionId
     */
    static async getById(questionId) {
        const [ db, client ] = await getConnection();
        try {
            //get cursor from database find query
            const cursor = await db.collection('questions').find(questionId);

            //destructure result object from `cursor.toArray` method 
            const [ result ] = await cursor.toArray();

            //throw error if result is null
            if (!result) {
                throw new ExpressError('No Question was found corresponding to the given question id', 404);
            }

            //return result if a truthy value was returned (this should only return an object when it contains desired info)
            return result;
        } catch(err) {
            //general error handling funnel
            throw new ExpressError(err.message, err.status || 500);
        }

        finally {
            //close client database connection
            client.close();
        }
    }

    static async new(question, category, email, isPreset=false) {
        const [ db, client ] = await getConnection();
        try {
            //create new question document from inputs
            const newQuestion = (isPreset ? createPresetQuestionDocument({question, category}) : createQuestionDocument({question, category, email}));

            //insert into collection and destructure result
            const { ops } = await db.collection('questions').insertOne(newQuestion);
            const [ result ] = ops;

            const user = await User.getUserByEmail(email);
            if (!!user) {
                await updateCollectionArray('users', 'questions', result._id, user._id, db);                
            }

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

module.exports = Question;