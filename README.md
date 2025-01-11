# Introduction
This is a simple website that has a login screen and a secure page. The header has a link back to the login page using the left title. It also contains the log out button on the right once the user logs in.

## Login Page
The sign in checks agains a database to find out if the combination is valid. Once it passes, a sessionID is returned which redirects the user to the secure page. Password visibility can be toggled.
The default username is `admin` with a password of `admin`, but can be changed in backend.py's set up section.

## Secure Page
If the user has a valid session, the page will load the private data. In this case, it is just a short message.
If the user has an invalid session, the page will state that the session is invalid and show a button to return home.

# Setting Up
## Frontend
The website was built on node 18.19.1 and can be run with `npm start` from the login folder once dependencies are installed with `npm i`. By default the port is `3000`.

## Backend
The server was built on python 3.12.3, flask, and the python-mysql connector. If using pip, the dependencies are listed in `backend/requirements.txt`. It can be started by running `backend/backend.py` with python.
The server is set up for HTTPS, so you will have to issue certificates for `cert.pem` and `key.pem`. You can use `openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365` from [here](https://blog.miguelgrinberg.com/post/running-your-flask-application-over-https) to create/sign the certificates. Alternatively, you can remove the ssl_context part at the bottom and change the login's settings to not use https.
By default the port is `5000`. If you want to change it, adjust `backend/backend.py` at the bottom and `login/src/index.js` in the `backendAdd` function.

## MySQL
MySQL was used for the database. A database `loginpage` should already be created before hand as well as a user `'admin'@'localhost'` with the password `Admin123$` that has all priviledges to `loginpage`. The backend will create the initial `users` table used for this demonstration. Be sure to update `backend/backend.py` in the Database `config` variable if any of the database account information needs to change.

## Docker
A dockerfile was included to save time on deployment. First, be sure to sign for `cert.pem` and `key.pem`. The database, front-end, and back-end should all start on their own. It exposes ports `3000` and `5000` and has environment variables for `MYSQL_ROOT_PASS`, `MYSQL_DATABASE`, `MYSQL_USER`, and `MYSQL_PASS` in case those need to be updated for a local database. If changing the backend port, be sure to adjust `login/src/index.js` and `backend/backend.py` in their appropriate locations and the `init` script in the dockerfile. If changing the database account information, make sure to update `backend/backend.py`'s `config` variable. The docker copies from the local directory, so it should be structured as such:

```plaintext
.
├── backend
│   ├── backend.py
│   ├── cert.pem
│   ├── key.pem
│   └── requirements.txt
├── Dockerfile
├── login
│   ├── package.json
│   ├── package-lock.json
│   ├── public
│   │   ├── index.html
│   │   └── robots.txt
│   └── src
│       ├── Components
│       │   ├── GlobalVars.js
│       │   └── Header.js
│       ├── index.css
│       ├── index.js
│       └── Pages
│           ├── Admin.js
│           └── Login.js
└── README.md

7 directories, 16 files
```