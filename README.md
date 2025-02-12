# doc_assist_p


Packages installed: 
* express: Web framework for routing system
* mongoose: database (MongoDB)
* dotenv: Environment variables


Few checks for express.js:
* In package.json, change "type" from commonjs to module.

* If the database is not connecting and it shows 'undefined' in the console log then somewhere, the code below is missing:
`import dotenv from 'dotenv';`
`dotenv.config();`