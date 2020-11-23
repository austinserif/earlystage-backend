const createUserDocument = require('./helpers/createUserDocument');
const mockUsersArray = [
    { 
        name: 'Testy Tester',
        email: 'testuser@email.com',
        password: 'superSecretPassword'
    },
    { 
        name: 'Testy Tester the 2nd',
        email: 'testuser2@email.com',
        password: 'superSecretPassword2!'
    }
]

/** returns an array of mock users ready to be seeded */
const getMockUsers = () => {
    return mockUsersArray.map(({name, email, password}) => (createUserDocument({name, email, password})));
}

module.exports = getMockUsers;
