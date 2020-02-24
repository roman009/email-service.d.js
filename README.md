# email-service.d

Schedules emails to be sent via Sendgrid and keeps track of blocked/spam/bounced emails

## Getting Started

The project runs on the Google Cloud Platform with the help of the following products:

- App Engine
- Cloud Functions
- Firestore
- Pubsub

It consists of 2 major parts: the API and the backend. 

### API
The API exposes 2 methods (`POST /mail/send`, `GET /health/check` and `GET /docs`).

The request `POST /mail/send` looks like this

````
POST http://localhost:8080/api/mail/send
Content-Type: application/json
X-TOKEN: some-auth-token

{
  "from": "fromemail@emailadddress.ro",
  "to": [
    "ema@email1.ro",
    "one@email2.ro"
  ],
  "cc": [
    "fromemail11@emailadddress.ro",
    "fromemail22@emailadddress.ro",
    "fromemail33@emailadddress.ro"
  ],
  "bcc": [
    "fromemail33@emailadddress.ro",
    "fromemail33@emailadddress.ro",
    "fromemail44@emailadddress.ro"
  ],
  "subject": "this is the subject",
  "body": "this is the body"
}
````
The response will be:

- `200` if the authentication is successful and the payload is validated
- `422` if the payload is invalid
- `401` if the token is invalid

After a successful validation of the payload, the service with post a new message in the `topic-web-requests` Pubsub topic.

### Backend
The backend consists of 3 Cloud Functions that are triggered via Pubsub topics:

- `function_process_web_requests`
- `function_process_email_requests`
- `function_process_check_requests`

### Installing

In order to install the dependencies, from the root dir you can run the following command:

- `./setup_local.sh`

## Running the tests

All the tests for backend and the API can be ran locally using the following command

- `./test_local.sh`

The tests include unit, functional and integration tests for the projects. Not all the micro-project have all the types of tests implemented - I've implemented only what made sense.

## Deployment

The deployment pipeline is triggered after a push to `master` in the github project. Google Cloud Build is triggered via a Webhook and runs the pipeline defined in `cloudbuild.yaml` (install, test, deploy)

## TODO (possible)  

- convert to Typescript
