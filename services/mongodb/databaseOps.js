const { mongoClientHandler } = require('./connect');
const ExpressError = require('../../ExpressError');
const { ObjectId } = require('bson');


/**
 * Returns a collection of database operation functions 
 * for the specified collection.
 * 
 * @param {String} collectionName 
 * 
 */
async function databaseOps(collectionName) {
    try {
        // get helpful utility functions from our mongo client handler
        const { getCollectionInstance, killSwitch, checkClientConnection } = await mongoClientHandler();

        // stores a connection to a specified collection, from which database operations can be made
        const collection = getCollectionInstance(collectionName);

        return {
            /**
             * Takes four parameters--`query <Object>`, `projection <Object>`, 
             * `pageNumber <Number>`, `pageSize <Number>`--and returns an array of objects
             * representing one page of results.
             * 
             * *NOTE:* Page indices start at 1.
             * 
             * @param {Object} query a query object as defined in MongoDB Node.js driver docs. It sets
             * the search parameters for what kinds of resources should be returned by a database.
             * 
             * @param {Object} projection a projection object as defined in the MongoDB Node.js driver docs.
             * It sets the output properties of the objects in the return array.
             * 
             * @param {Number} pageNumber sets the maximum number of results to be returned by the array.
             * @param {Number} pageSize determines the number of results to skip before returning a results array.
             */
            async getPage(query, projection, pageNumber, pageSize) {
                try {

                    // throw error if query or projection are passed non-object args
                    if (typeof query !== 'object' || typeof projection !== 'object') {
                        throw new ExpressError('query and projection args must both be type Object.', 500);
                    }

                    // throw error if pageNumber or pageSize are passed non-Number args
                    if (typeof pageNumber !== 'number' || typeof pageSize !== 'number') {
                        throw new ExpressError('pageNumber and pageSize args must both be type Number.', 500);
                    }

                    // throw error if pageNumber or pageSize are less than 1
                    if (pageNumber < 1 || pageSize < 1) {
                        throw new ExpressError('indices for pageNumber and pageSize begin at 1; cannot be 0 or negative numbers', 500);
                    }
                    
                    // calculates the number of skips based on page number and size of page
                    const skips = pageSize * (pageNumber - 1)

                    // sorts by ascending timestamp
                    const sort = { timestamp: 1 };

                    // assemble an options object that includes the sort and projection preferences
                    const options = {
                        projection,
                        sort
                    };

                    // stores a cursor containing a page of resource objects
                    const cursor = collection.find(query, options).skip(skips).limit(pageSize);

                    // convert the cursor into an array
                    const resultsArray = await cursor.toArray();

                    // return results
                    return resultsArray;
                } catch (err) {
                    throw new ExpressError(err.message, err.status || 500);
                } finally {
                    await killSwitch();
                }
            },
            /**
             * Takes an `id <String>` parameter as its only input 
             * and returns the corresponding document (as an <Object>).
             * The function throws an error if no matching document is
             * found, or if the input id is not a string.
             * 
             * @param {String} id
             */
            async getResource(id) {
                try {
                    // throws error if input is not a string
                    if (typeof id !== 'string') throw new ExpressError('Input must be a string', 500);

                    // pass id string to ObjectId constructor to create abstract type understood by MongoDB
                    const _id = new ObjectId(id);

                    // queries database for document with an id match input arg
                    const result = await collection.findOne({ _id });

                    // throw error if no document is returned from query
                    if (!result) throw new ExpressError('No matching documents found', 500);

                    // return result 
                    return result;
                } catch (err) {
                    throw new ExpressError(err.message, err.status || 500);
                } finally {
                    await killSwitch();
                }
            },
            /**
             * Takes only one parameter, `documents <Object[]>`, and inserts each
             * item in `document` argument into the collection. The function returns
             * an integer indicating the number of successfully inserted documents.
             * An error is thrown if the argument is not an array, is an empty array,
             * or is an array that contains any items that are not objects.
             * 
             * @param {Object[]} documents
             */
            async setResources(documents) {
                try {
                    // throw error if documents array is empty or not an array
                    if (!Array.isArray(documents)) throw new ExpressError('Input must be an array', 500);
                    if (documents.length === 0) throw new ExpressError('Input array cannot be empty', 500);

                    // throw error if any array items are not objects
                    documents.forEach((o) => {
                        if (typeof o !== 'object') throw new ExpressError('All array items must be objects', 500);
                    });

                    // insert items into database
                    const result = await collection.insertMany(documents);

                    // return the number of inserted items
                    return result.insertedCount;
                } catch (err) {
                    throw new ExpressError(err.message, err.status || 500);
                } finally {
                    await killSwitch();
                }
            },
            /**
             * Takes one parameter, `id <String>`, and deletes the resource 
             * from the database. If no resource is found, or the input type 
             * is incorrect, the function will throw an error. Otherwise, 
             * it returns `true`.
             * 
             * @param {String} id 
             */
            async deleteResource(id) {
                try {
                    // throws error if input is not a string
                    if (typeof id !== 'string') throw new ExpressError('Input must be a string', 500);

                    // pass id string to ObjectId constructor to create abstract type understood by MongoDB
                    const _id = new ObjectId(id);

                    // deletes first document with matching _id property (should only be one by definition)
                    const result = await collection.deleteOne({ _id });

                    // throw error if no document is returned from query
                    if (result.deletedCount === 0) throw new ExpressError('No matching documents found', 500);

                    // return result 
                    return true;
                } catch (err) {
                    throw new ExpressError(err.message, err.status || 500);
                } finally {
                    await killSwitch();
                }
            },
            /**
             * Takes two parameters, `id <String>` and `updates <Object[]>`,
             * and performs all modifications described in the `updates` array,
             * finally returning the `<Number>` of modified documents.
             * The function throws an error if either input is not of the
             * expected type, or if the provided `id` string does not match
             * and documents in the database.
             * 
             * @param {String} id the _id property of a MongoDB document
             * @param {Object[]} updates an array of objects, where each 
             * object has exactly two keys: `field` and `value`. The `field` 
             * property describes the path (using dot-notation for nested fields) 
             * in a given document to the field to be modified. The `value` property 
             * contains the information that the described field is going to be 
             * overwritten with.
             */
            async updateResource(id, updates) {
                try {
                    // throws error if id input is not a string
                    if (typeof id !== 'string') throw new ExpressError('First parameter must be a string', 500);

                    // throws error if updates is either an empty array or not an array
                    if (!Array.isArray(updates) || updates.length === 0) throw new ExpressError('Second parameter must be an array with at least one item', 500);

                    // creates an empty object to contain all updates
                    const updatesObject = new Object();
            
                    // map the updates array fields into the updatesObject
                    updates.forEach((o) => {
                        // throws error if updates array contains an object with incorrect fields
                        if (!o.hasOwnProperty('field') || (!o.hasOwnProperty('value'))) throw new ExpressError('All items in updates array must contain both of the following properties: field, value', 500);

                        // set field path and overwrite value into the updates object as a key-value-pair
                        updatesObject[o.field] = o.value;
                    });

                    //insert changes into target document
                    const result = await collection.updateOne(
                        {_id: new ObjectId(id)},
                        {
                            $set: {
                                ...updatesObject
                            }
                        }
                    );

                    // if no response is returned throw a general error
                    if (!result) throw new ExpressError('No response was returned from the database operation', 500);

                    //destructure count properties
                    const { matchedCount, modifiedCount } = result;

                    // throw error if no document was matched
                    if (matchedCount === 0) throw new ExpressError('No matching documents found', 500);

                    // throw error if no modifications were made
                    if (modifiedCount === 0) throw new ExpressError('Updates were expected, but none were made', 500);

                    // return the number of modified documents
                    return modifiedCount;
                } catch (err) {
                    throw new ExpressError(err.message, err.status || 500);
                } finally {
                    await killSwitch();
                }
            }
        }
    } catch (err) {
        throw new ExpressError(err.message, err.status || 500);
    }
}

module.exports = databaseOps;