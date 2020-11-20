# Early Stage Due Diligence (Backend)

## Overview


## Quick Start

Follow these instructions to get started:

1. Clone repository to your local machine

2. Run `npm install` to install dependencies and initialize a git repository.

3. Create `.env` and `.gitignore` files in the project's root directory: `touch .env .gitignore`. Your `.gitignore` should include *at least* these three lines:
    ```txt
        .env
        node_modules
        package-lock.json
    ```

4. Setup a MongoDB NoSQL database, and have the uri for your new database cluster handy for the next step.

5. Edit your `.env` to contain the following variables:
    - Workfactor for bcrypt: `echo "BCRYPT_WORK_FACTOR=12" >> .env`
    - MongoDB URI: `echo "DB_URI=<your-database-uri-here>" >> .env`

    Your `.env` file should now look like this:
    ```txt
        BCRYPT_WORK_FACTOR=12
        DB_URI=<your-mongodb-database-uri-here>
    ```


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

