# REST API - CRUD Operation on texting acronyms/slangs data populated in mongoDB (using mongoose)

## To run the NodeJS server after cloninig the repo
In terminal
1. At the root directory, type `yarn` to install and `yarn start:backend` to start the server
2. At `/client`, `yarn` to install and `yarn start` to start

## Things to note
- This repository does not contain the owner's mongodb database credentials and it can be provided upon request
- The user can use his/her own mongodb credentials saved in an environment variable named `MONGO_URI` in order to populate data into a given mongoDB database
- The frontend directory is created using `create-react-app`, which was less prioritized as this exercise mainly focused on building the backend
- To best test the application's behaviour, use an API platform such as `Postman` or `Insomnia`

## Endpoints

GET `/acronym (?page=1&limit=10&search=:search)`
- returns a list of acronyms, pagination using query parameters
- response headers indicate if there are more results (next, previous objects inside the reponse header indicate the number of available results in its page)
- returns all acronyms that fuzzy match against :search

POST `/acronym`
- receives an acronym and definition string
- adds the acronym definition to the db

PATCH `/acronym/:acronymID`
- updates the acronym for :acronymID

DELETE `/acronym/:acronymID`
- deletes the acronym for :acronymID
