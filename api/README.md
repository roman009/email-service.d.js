# API
The API exposes 2 methods (`POST /mail/send`, `GET /health/check` and `GET /docs/swagger`).

The request `POST /mail/send` looks like this

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
- `422` if the payload is invalid
- `401` if the token is invalid

After a successful validation of the payload, the service with post a new message in the `topic-web-requests` Pub/Sub topic.

`GET /health/check` is a health check endpoint for the service used by Google App Engine

`GET /docs/swagger` is used to serve the Swagger API documentation