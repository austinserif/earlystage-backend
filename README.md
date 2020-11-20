# Early Stage Due Diligence (Backend)

## Overview


## Quick Start

Follow these instructions to get started:

1. Clone repository to your local machine

2. Run `npm install` to install dependencies

3. Create a file for environment variables in the project's root directory: `touch .env`.

4. Setup a MongoDB NoSQL database, and get your database uri ready for the next step.

5. Edit your `.env` to contain the following variables:
    - Workfactor for bcrypt: `echo "BCRYPT_WORK_FACTOR=12" >> .env`
    - MongoDB URI: `echo "DATABASE_URI=<your-database-uri-here>" >> .env`


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

