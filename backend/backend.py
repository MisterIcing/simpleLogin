from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import uuid
import mysql.connector
from bcrypt import hashpw, gensalt, checkpw

########################################################################################################
# Notes
# Using mysql for the database, so some segments may be based on the docs pages https://dev.mysql.com/doc/
#
########################################################################################################
#Set up connections

# set up flask
app = Flask(__name__)

# set up cors
CORS(app, resources={r'/*': {'origins': '*'}})

# defaults for login screen
USERNAME = 'admin'
PASSWORD = 'admin'

########################################################################################################
#Database

# config
config = {
    'user': 'admin',
    'password': 'Admin123$',
    'host': 'localhost',
    'database': 'loginpage'
}

# set up database
mysqldb = mysql.connector.connect(**config)
db = mysqldb.cursor()
# db.execute('DROP TABLE IF EXISTS users')
db.execute('CREATE TABLE IF NOT EXISTS users ( '
           '    username  VARCHAR(64) UNIQUE NOT NULL, '
           '    password  VARCHAR(255) NOT NULL, '
           '    sessionID VARCHAR(36), '
           '    PRIMARY KEY (username) '
           ')'
           )

addUser = ('INSERT IGNORE INTO users '
           '(username, password, sessionID) '
           'VALUES (%s, %s, %s)'
           )

updateSessionByUser = ('UPDATE users '
                 'SET sessionID = %s '
                 'WHERE username = %s '
                 )

updateSessionByID = ('Update users '
                     'SET sessionID = %s '
                     'WHERE sessionID = %s '
                     )

db.execute(addUser, (USERNAME, hashpw(PASSWORD.encode('ascii'), gensalt()).decode('ascii'), None))
mysqldb.commit()

db.close()
mysqldb.close()

########################################################################################################
#API calls

# - POST `/login`
# 	- Takes a username and password, comparing the form to the database and returning a new sessionID if it is valid
# 	- Inputs:
# 		- `username`: plaintext username
#       - `password`: plaintext password
# 	- Outputs:
# 		- 200: sessionID related to the account
#       - 401: invalid username or password
@app.route('/login', methods=['OPTIONS', 'POST'])
def login():
    # preflight
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = make_response('', 200)
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response

    data = request.json
    username = data.get('username')
    password = data.get('password')

    mysqldb = mysql.connector.connect(**config)
    db = mysqldb.cursor()

    # find if username in database
    db.execute("SELECT * FROM users WHERE username = %s", (username,))
    if query := db.fetchone():
        # check password if username found
        if checkpw(password.encode('ascii'), query[1].encode('ascii')):
            # issue new sessionID and return
            result = str(uuid.uuid4())
            db.execute(updateSessionByUser, (result , username,))
            mysqldb.commit()
            db.close()
            mysqldb.close()
            return jsonify(sessionID=result), 200
        else:
            # invalid password
            db.close()
            mysqldb.close()
            return jsonify(sessionID=None, error='Incorrect username and password'), 401
    # invalid username
    db.close()
    mysqldb.close()
    return jsonify(sessionID=None, error='Incorrect username and password'), 401

# - POST `/logout`
# 	- Takes a sessionID and clears it from the database
# 	- Inputs:
# 		- `sessionID`: uuid4 string
# 	- Outputs:
# 		- 200: end session
#       - 404: no session to end
@app.route('/logout', methods=['OPTIONS', 'POST'])
def logout():
    # preflight
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = make_response('', 200)
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response

    data = request.json
    sessionID = data.get('sessionID')

    mysqldb = mysql.connector.connect(**config)
    db = mysqldb.cursor()

    # find sessionID in database
    db.execute("SELECT * FROM users WHERE sessionID = %s", (sessionID,))
    if query := db.fetchone():
        if query[2] is not None:
            # clear sessionID from db
            db.execute(updateSessionByID, (None, sessionID))
            mysqldb.commit()
            db.close()
            mysqldb.close()
            return jsonify(result='Session ended'), 200
    # invalid sessionID given or missing
    db.close()
    mysqldb.close()
    return jsonify(result=None, error='Invalid session ID'), 404

# - POST `/check`
# 	- Checks if the sessionID is in the table
# 	- Inputs:
# 		- `sessionID`: uuid4 string
# 	- Outputs:
# 		- 200: True if sessionID is in database, False if sessionID is not
@app.route('/check', methods=['OPTIONS', 'POST'])
def checkSession():
    # preflight
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = make_response('', 200)
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response

    data = request.json
    sessionID = data.get('sessionID')

    mysqldb = mysql.connector.connect(**config)
    db = mysqldb.cursor()
    # find sessionID in database
    db.execute("SELECT * FROM users WHERE sessionID = %s", (sessionID,))
    if db.fetchone():
        # return true if found
        db.close()
        mysqldb.close()
        return jsonify(result=True), 200
    # return false
    db.close()
    mysqldb.close()
    return jsonify(result=False), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, ssl_context=('cert.pem', 'key.pem'))