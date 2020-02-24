# `function_process_web_requests` 
 
A Function that is triggered my Pub/Sub messages posted in the `topic-web-requests` topic. It creates a list of unique recipients, checks the email addresses against the list of blocked emails and then publishes `send email` messages to the `topic-email-requests` Pub/Sub topic.