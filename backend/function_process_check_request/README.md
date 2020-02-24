# `function_process_check_requests` 

A Function that is triggered my Pub/Sub messages posted in the `topic-check-requests` topic. It checks every minute for new addresses that are added to the suppression list from Sendgrid. It downloads the new email as stores them in a Firestore collection called `blocked_emails` for future use 
