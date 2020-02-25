# email-service.d

Schedules emails to be sent via Sendgrid and keeps track of blocked/spam/bounced emails

## Getting Started

The project runs on the Google Cloud Platform with the help of the following products:

- App Engine
- Cloud Functions
- Firestore
- Pub/Sub
- Storage
- Cloud Build
- Cloud Scheduler

The code is Javascript running in node.js versions 13 (API) and 10 (Google Function limitation)

It consists of 2 major parts: the API and the backend. 

### API
The API exposes 3 methods (`POST /api/mail/send`, `GET /health/check` and `GET /docs/swagger`).

The request `POST /api/mail/send` looks like this

````
POST https://email-service-d.appspot.com/api/mail/send
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
- `401` if the token is invalid
- `422` if the payload is invalid

After authentication and a successful validation of the payload, the service will post a new message in the `topic-web-requests` Pub/Sub topic.

`GET /health/check` is a health check endpoint for the service used by Google App Engine.

`GET /docs/swagger` is used to serve the Swagger API documentation.

### Backend
The backend consists of 3 Cloud Functions that are triggered via Pub/Sub topics and a Cron:

- `function_process_web_requests` - a Function that is triggered by Pub/Sub messages posted in the `topic-web-requests` topic coming from the API. It creates a list of unique recipients, checks the email addresses against the list of blocked emails and then publishes `send email` messages to the `topic-email-requests` Pub/Sub topic.
- `function_process_email_requests` - a Function that is triggered by Pub/Sub messages posted in the `topic-email-requests` topic posted by `function_process_web_requests`. It calls the Sendgrid API to send one email.
- `function_process_check_requests` - a Function that is triggered by Pub/Sub messages posted in the `topic-check-requests` topic posted by the cron job `post_check_msg_to_topic-check-sendgrid-requests` define in `cloudbuild.yaml`. It checks every minute for new addresses that are added to the suppression list from Sendgrid. It downloads the suppressed email addresses as stores them in a Firestore collection called `blocked_emails` for future reference. 
- A cron - `post_check_msg_to_topic-check-sendgrid-requests` - that is setup during deployment that runs every minute and adds a message in the `topic-check-requests` Pub/Sub topic.

### Installing

In order to install the dependencies, from the root dir you can run the following command:

- `./setup_local.sh`

## Running the tests

All the tests for backend and the API can be ran locally using the following command:

- `./test_local.sh`

The tests include unit, functional and integration tests for the projects. Not all the micro-project have all the types of tests implemented - I've implemented only what made sense.

## Deployment

The deployment pipeline is triggered after a push to `master` in the github project. Google Cloud Build is triggered via a Webhook from Github and runs the pipeline defined in `cloudbuild.yaml` (install, test, deploy).

Production credentials are stored in a private bucket in the Storage service in an `.env` file. After the `install` phase of the deployment, the `.env` file is copied from the bucket locally, to the mini-projects directories.  

## TODO (possible)  

- convert to Typescript
- cleanup .env files and implement the Secret Manager product from Google Cloud
- convert implementation to a Kubernetes cluster to abstract the cloud provider
- extract the functions to their own repositories so that can be deployed independently and make deployment faster  
