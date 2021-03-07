# Early Stage Due Diligence (Backend)

## Overview


## Quick Start

Follow these instructions to get started:

1. Clone repository to your local machine

2. Run `npm install` to install dependencies and initialize a git repository.

3. Create `.env` and `.gitignore` files in the project's root directory: `touch .env .gitignore`. Before commiting, make sure your `.gitignore` includes *at least* these three lines:
    ```txt
        .env
        node_modules
        package-lock.json
    ```

4. Setup a MongoDB NoSQL database, and have the uri for your new database cluster handy for the next step.

5. Edit your `.env` to contain the following variables:
    - *BCRYPT_WORK_FACTOR*: `echo "BCRYPT_WORK_FACTOR=12" >> .env`
    For more information on work factors, see this [great article](https://auth0.com/blog/hashing-in-action-understanding-bcrypt/) by Dan Arias at authO. Additionally, you can check out [bcrypt's own documentation](https://www.npmjs.com/package/bcrypt]) for Node.js.
    - *SECRET_KEY*: This part is up to you! `echo "SECRET_KEY=<your-secret-key>"`
    - *DB_URI*: `echo "DB_URI=<your-database-uri-here>" >> .env`
    - *DB_NAME*: `echo "DB_NAME=<your-database-name-here>" >> .env`
    - *TEST_DB_URI*: `echo "TEST_DB_URI=mongodb://127.0.0.1:27017" >> .env`
    - *TEST_DB_URI*: `echo "TEST_DB_NAME=earlystage-due-diligence-test" >> .env`
    - *PORT*: Set your testing port to 4000 `echo "PORT=4000" >> .env`


    Your `.env` file should now look like this:
    ```txt
        BCRYPT_WORK_FACTOR=12
        DB_URI=<your-database-uri-here>
        DB_NAME=<your-database-name-here>
        TEST_DB_URI=<your-test-database-uri-here>
        TEST_DB_NAME=earlystage-due-diligence-test
        PORT=4000
    ```

## Setting up MongoDB Community Server
1. [Installation instructions for Mac](https://zellwk.com/blog/install-mongodb/)
2. [Installation instructions for Windows](https://treehouse.github.io/installation-guides/windows/mongo-windows.html)
3. [Instructions for working with mongodb locally](https://zellwk.com/blog/local-mongodb/)
4. Once you have access to the `db` shell object and its methods, execute the following commands


```
> use <your-test-database-name-here>
switched to db <your-test-database-name-here>
> db.createCollection('users')
{ "ok" : 1 }
> db.createCollection('questions')
{ "ok" : 1 }
> db.createCollection('components')
{ "ok" : 1 }
> db.createCollection('workspaces')
{ "ok" : 1 }
```

#### Input Sanitation with MongoDB
Unlike many SQL drivers that execute instructions and data from a single string (and thus require input sanitation), most of the time MongoDB inputs do not need to be sanitized on insert. However there are some instances in which reading data and then executing it could make your database vulnerable to attack. Here are some resources:

1. [A VERY lightweight library for sanitizing mongodb inputs](https://www.npmjs.com/package/mongo-sanitize)
2. [Useful Stackoverflow Article](https://stackoverflow.com/questions/30585213/do-i-need-to-sanitize-user-input-before-inserting-in-mongodb-mongodbnode-js-co)

## Testing
1. Once all of the above steps have been followed, you can run the test command: `npm test`
2. For more details on test structure, see the `__tests__` directory.

## Routes

#### Users
1. GET `/users/` *Admin Only*

2. POST `/users/:email`
    - **Body**: `name`, `email`, `password`.
    - **Description**
    - **Responses**
        - 201: Resource created successfully
        - 409: Email already in use

    example request:
    ```js
        const response = await axios({
            method: 'post',
            url,
            data: {
                name,
                email,
                password 
            }
        });
    ```
3. PATCH `/users/:email` *Authorized User Only*
4. DELETE `/users/:email` *Authorized User Only*

#### Workspaces
1. GET `/workspaces/:id`  *Authorized User's Workspace Only*
2. POST `users/:email/workspaces/:workspaceId` *Authorized User Only*
3. PATCH `users/:email/workspaces/:workspaceId` *Authorized User's Workspace Only*
4. DELETE `users/:email/workspaces/:workspaceId` *Authorized User's Workspace Only*

#### Questions
1. GET `/users/:email/questions` *Authorized User Only*
2. GET `/users/:email/questions/:questionId` *Authorized User Only*
3. POST `/users/:email/questions` *Authorized User Only*
4. PATCH `/users/:email/questions/:questionId` *Authorized User Only*
5. DELETE `/users/:email/questions/:questionId` *Authorized User Only*
