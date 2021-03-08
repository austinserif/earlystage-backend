const { ObjectID } = require('bson');
const ExpressError = require('./ExpressError');

/**
 * 
 * @param { String } collectionName 
 * @param { Array } updates 
 * @param { String } targetId 
 * @param { MongoClient } db 
 */
const updateCollection = async (collectionName, updates, targetId, db) => {
    try {
        //initialized updatesObj
        const updatesObj = {};

        //map updates array argument into new updatesObj variable
        updates.forEach(o => (updatesObj[o.field] = o.value));

        //return result array 
        const result = await db.collection(collectionName).updateOne(
            {_id: new ObjectID(targetId)},
            {
                $set: {
                    ...updatesObj,
                    'metadata.lastModified': new Date()
                }
            }
        );

        //destructure count properties
        const { matchedCount, modifiedCount } = result;

        //throw error if either of the count properties returned a falsy value
        if ( !matchedCount || !modifiedCount ) {
            throw new ExpressError('Resource either could not be found, or could not be updated, or both', 404);
        }

        //return result
        return result;

    } catch(err) {
        throw new ExpressError(err.message, err.status || 500)
    }
}

/**
 * 
 * @param {*} collectionName 
 * @param {*} arrayPath 
 * @param {*} resource 
 * @param {*} targetId 
 * @param {*} db 
 */
const updateCollectionArray = async (collectionName, arrayPath, resource, targetId, db) => {
    try {
        const result = await db.collection(collectionName).updateOne(
            {_id: new ObjectID(targetId)},
            {
                $push: {
                    [arrayPath]: resource
                }
            }
        );
        return result;

    } catch (err) {
        throw new ExpressError(err.message, err.status || 500);
    }
}

module.exports = {
    updateCollection,
    updateCollectionArray
}