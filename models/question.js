const getConnection = require('./connect');

class Question {
    static async getById(questionId) {
        const [ db, client ] = await getConnection();
        try {
            
        } catch(err) {

        }
    }
}