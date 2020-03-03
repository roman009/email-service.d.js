const Firestore = require('@google-cloud/firestore')
const { PubSub } = require('@google-cloud/pubsub')
require('dotenv').config()

const db = new Firestore({ projectId: process.env.GOOGLE_PROJECT_ID || 'email-service-d' })
const pubSubClient = new PubSub({ projectId: process.env.GOOGLE_PROJECT_ID || 'email-service-d' })
const TOPIC_EMAIL_REQUESTS = process.env.TOPIC_EMAIL_REQUESTS || 'topic-email-requests'

exports.db = db
exports.pubSubClient = pubSubClient

exports.processWebRequest = async (pubSubEvent, context) => {
  const webRequest = pubSubEvent.data
    ? JSON.parse(Buffer.from(pubSubEvent.data, 'base64').toString())
    : undefined

  console.log('Received webRequest!')
  console.log(webRequest)

  const finalWebRequest = {
    from: webRequest.from,
    subject: webRequest.subject,
    body: webRequest.body,
    to: [],
    cc: [],
    bcc: []
  }

  const toRecipientEmails = await this.blockedEmails(this.uniqueEmails(webRequest.to))
  if (webRequest.cc === undefined) {
    webRequest.cc = []
  } else {
    finalWebRequest.cc = await this.blockedEmails(this.uniqueEmails(webRequest.cc))
  }

  if (webRequest.bcc === undefined) {
    finalWebRequest.bcc = []
  } else {
    finalWebRequest.bcc = await this.blockedEmails(this.uniqueEmails(webRequest.bcc))
  }

  for (const toRecipientEmail of toRecipientEmails) {
    finalWebRequest.to = [toRecipientEmail]
    const dataBuffer = Buffer.from(JSON.stringify(finalWebRequest))
    const messageId = await pubSubClient.topic(TOPIC_EMAIL_REQUESTS).publish(dataBuffer)
    console.log(`Message ${messageId} published.`)
  }

  console.log('Processed webRequest!')
  console.log(finalWebRequest)
}

const allEmails = []
exports.uniqueEmails = (emailList) => {
  for (const key in emailList) {
    if (allEmails.includes(emailList[key])) {
      delete emailList[key]
    } else {
      allEmails.push(emailList[key])
    }
  }

  return emailList.filter(n => n)
}

exports.blockedEmails = async (emailList) => {
  for (const key in emailList) {
    const emailCheck = await db.collection('blocked_emails').doc(emailList[key]).get()
    if (emailCheck.exists) {
      delete emailList[key]
    }
  }

  return emailList.filter(n => n)
}
