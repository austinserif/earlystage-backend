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
    - Choose a work factor for bcrypt: `echo "BCRYPT_WORK_FACTOR=12" >> .env`
    For more information on work factors, see this [great article](https://auth0.com/blog/hashing-in-action-understanding-bcrypt/) by Dan Arias at authO. Additionally, you can check out [bcrypt's own documentation](https://www.npmjs.com/package/bcrypt]) for Node.js.
    - MongoDB URI: `echo "DB_URI=<your-database-uri-here>" >> .env`


    Your `.env` file should now look like this:
    ```txt
        BCRYPT_WORK_FACTOR=12
        DB_URI=<your-mongodb-database-uri-here>
    ```

## Development and Testing

### Development 

#### Helpful Resources
I had previously dipped my toe into the world of development with NoSQL databases and drivers, but this project was the **first time** that I found myself *completely submerged* in the process of spinning up a NoSQL database layer. In case anyone reading this is going through that experience now, here are the resources I used for setting up a local mongodb development server:

1. [Documentation for MongoDB Extension of Jest](https://jestjs.io/docs/en/mongodb)
2. [Installing MongoDB on Mac (Catalina and non-Catalina)](https://zellwk.com/blog/install-mongodb/)
3. [How to setup a local MongoDB connection](https://zellwk.com/blog/local-mongodb/)

#### Input Sanitation with MongoDB
This is another message for those coming from SQL databases primarily. Unlike many SQL drivers that execute instructions and data from a single string (and thus require input sanitation), most of the time MongoDB inputs do not need to be sanitized on insert. However there are some instances in which reading data and then executing it could make your database vulnerable to attack. Here are some resources:

1. [A VERY lightweight library for sanitizing mongodb inputs](https://www.npmjs.com/package/mongo-sanitize)
2. [Useful Stackoverflow Article](https://stackoverflow.com/questions/30585213/do-i-need-to-sanitize-user-input-before-inserting-in-mongodb-mongodbnode-js-co)

## Routes

#### Users
1. GET `/users/:id`
2. POST `/users/:id`
3. UPDATE `/users/:id`
4. DELETE `/users/:id`

#### Workspaces
1. GET `/workspaces/:id`
2. POST `/workspaces/:id`
3. UPDATE `/workspaces/:id`
4. DELETE `/workspaces/:id`


## Database Schema


## Dependencies

