
# Notes

A set of notes, save it if you want.

# Requirements

Notes are persisted to a [mongo](http://www.mongodb.org) database.

# Running the server

To run the server just run `node src/server/index` or `npm start`. The service starts by default listening to port
`9874` and assumes that the URL used to access it is `http://localhost:9874/`, to change these use additional
command line parameters:

    node src/server/index -port 8080 -base "https://mynotesapp.com/"

Sessions are run through [session-middleware](https://npmjs.org/package/session-middleware) to provide a salt for its
encryption either set the command line argument `-salt` or run the process with an environment variable `sessionKey`.

# Limitations

Clearly lacking encryption - everything is in plain text in the database, so while
[gauth](https://npmjs.org/package/gauth) means there's no passwords there is an email address, this wil be fixed soon.

# Patches and Pull Requests

Feel free to add things and send a pull request.

# Licence

Released under the MIT license.

