## KITT ticket system - Backend documentation

Written by Roope Sinisalo, spring 2024

### Starting development

0. First of all, go through the main README.md

1. Copy the `.env.example` file to same location and rename it as `.env`. **Note**: do **NOT** remove the original file.

Now you can define any secret environmental variables, **though as of 16.2.2024 none exist**

2. After installing all backend dependencies with `npm install`, you can start the server by running `npm start`.

This will also generate the database file to the backend project using `config/schema.sql` (read more below). If at any point the developer wants to wipe all the data they can simply delete the `database.db` file and restart the server.

3. `npm run db:seed` can be used to add testing data to the database. The data is defined in `config/data.sql`. **Note**, however, that running this multiple times will result the same data being added multiple times.

### Filestructure

The backend project is divided into following parts:

- api/
- config/
- services/
- index.js
- database.db

#### index.js

The core of the backend. This file is used to start the server. It imports all different endpoints collected to api/index.js (see below) at once.
It is also where the server port and some other settings are or could be defined.

#### api/

This directory has all different endpoints available to the frontend.
The name of the file should be whatever comes after /api/ in the url, so for example tickets.js has code for /api/tickets.
The directory also has `index.js` file that serves as the main router. All endpoints should be defined in the file.
**Important**: Endpoints should not interact with the database themselves.
Instead, endpoints should make use of services (see below) which in turn operate with the database.
This is because in theory, multiple endpoints can have similar functionality and therefore cause duplication of code.
This way multiple endpoints can use the same service method, and just filter or sort the data differently, whatever the need be.
Now, there may be exceptions and those are allowed for good and defined reasons, but by default there should be no real logic or db interactions directly in the endpoint.

#### services/

Like mentioned above, services are used to interact with the database, creating an extra, reusable layer between the database and api-endpoints.

#### config/

Directory for basically all sorts of configuration files.
It also has the `db.js` file which has the `query()` method used to execute SQL.

schema.sql has SQL for creating tables, and the file is used whenever the backend is restarted. However, due to `IF NOT EXISTS` the tables are created only once.

data.sql contains mock data, and can be used to seed the database with command `npm run db:seed`.

#### database.db

The actual, entire database, as a file. This should probably stay .gitignored, because it can get quite big, quite fast.
In the future there should also be some kind of backup script that dumbs the database into a file and sends it to somewhere.
