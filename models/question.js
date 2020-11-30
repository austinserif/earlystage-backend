const ExpressError = require('../helpers/ExpressError');
const User = require('./user');
const { ObjectID } = require('bson');
const { updateCollectionArray } = require('../helpers/updateCollection');
const getConnection = require('./connect');
const { createQuestionDocument, createPresetQuestionDocument } = require('../helpers/createDocument');

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
            const cursor = await db.collection('questions').find({_id: new ObjectID(questionId)});

            //destructure result object from `cursor.toArray` method 
            const objArray = await cursor.toArray();

            const [ result ] = objArray;

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

    static async getAllQuestions(email) {
        const [ db, client ] = await getConnection();
        try {
            const cursor = await db.collection('questions').find(
                { $or: [ {userEmail: {$eq: email}}, {isPreset: {$eq: true}} ] }
            )

            const result = await cursor.toArray();

            if (!result) {
                throw new ExpressError('No Questions were found corresponding', 404);
            }

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
     * @param {*} question 
     * @param {*} category 
     * @param {*} email 
     * @param {*} isPreset 
     */
    static async new(question, category, email, isPreset) {
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

    static async delete(email, questionId) {
        const [ db, client ] = await getConnection();
        try {

            //remove question associated with questionId if it meets certain conditions
            const res = await db.collection('questions').removeOne(
                {
                    $and: [
                            {userEmail: { $eq: email }},
                            {_id: { $eq: new ObjectID(questionId)}},
                            {isPreset: { $eq: false }}
                    ]
                }
            )

            //udpdate user questions reference array --> the logic here could probably be better
            await db.collection('users').updateOne(
                {email: {$eq: email}},
                {
                    $pull: { questions: questionId }
                }
            );

            //destructure result
            const { nDeleted } = res;

            //throw error if nothing was actually deleted
            if (!nDeleted) throw new ExpressError('Question could not be deleted', 401); //what status code is this?

            return res;
            
        } catch(err) {
            throw new ExpressError(err.message, err.status || 500);
        }

        finally {
            client.close();
        }
    }
}

module.exports = Question;