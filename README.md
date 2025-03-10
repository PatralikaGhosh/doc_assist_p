# doc_assist_p


Packages installed: 
* express: Web framework for routing system
* mongoose: database (MongoDB)
* dotenv: Environment variables
* cors: Enables the frontend (running on localhost:5173 with Vite.js) to communicate with the backend (running on localhost:5000 with Express).

* body-parser: Express does not process JSON requests by default. body-parser helps extract data from incoming POST requests.

* child_process: Since NLTK is a Python library, we need a way to execute Python scripts from our Node.js backend. child_process allows us to spawn and run external processes (like Python).

Few checks for express.js:
* In package.json, change "type" from commonjs to module.

* If the database is not connecting and it shows 'undefined' in the console log then somewhere, the code below is missing:
`import dotenv from 'dotenv';`
`dotenv.config();`

We used:
* Database: MongoDB
* Servers: Express.js and Node.js
* Frontend: Vite.js
* Docker
* Postman
* Chakra UI
* Figma: https://www.figma.com/design/9LZIgmz7KY4xdhkw3o6w4w/docAssist?node-id=0-1&t=T1nypVHKwNcrhcSv-1


# Development Schedule
| Week  | Issue Number/s | People Assigned |
| ------------- | ------------- | ------------- |
| 2/24-3/2 | https://github.com/PatralikaGhosh/doc_assist_p/issues/1  https://github.com/PatralikaGhosh/doc_assist_p/issues/2 | Timothy Smith |
| 2/24-3/2 | https://github.com/PatralikaGhosh/doc_assist_p/issues/3 https://github.com/PatralikaGhosh/doc_assist_p/issues/6 | Patralika Ghosh |
| 2/24-3/2 | https://github.com/PatralikaGhosh/doc_assist_p/issues/8 | Rohan Ganta |
| 3/5 | *MVP DUE* | ALL |
| 3/3-3/23 | https://github.com/PatralikaGhosh/doc_assist_p/issues/10 https://github.com/PatralikaGhosh/doc_assist_p/issues/11 | not assigned |
| 3/3-3/23 | https://github.com/PatralikaGhosh/doc_assist_p/issues/9 https://github.com/PatralikaGhosh/doc_assist_p/issues/13 | not assigned |
| 3/3-3/23 | https://github.com/PatralikaGhosh/doc_assist_p/issues/12 https://github.com/PatralikaGhosh/doc_assist_p/issues/5 | not assigned |
| 3/23-4/2 | https://github.com/PatralikaGhosh/doc_assist_p/issues/7 | *sub-parts will be decided later* |
| 4/14 | *PROJECT CODE DUE* | ALL |
| 4/16 | *TESTING RESULTS DUE* | ALL |
| 4/16 | *POSTER DUE* | ALL |
| 4/17 | *POSTER PRESENTATION* | ALL |
| 4/25 | *LAST WORKING DAY* | ALL |
