const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
exports.sgMail = sgMail

exports.processEmailRequest = async (pubSubEvent, context) => {
  const emailRequest = pubSubEvent.data
    ? JSON.parse(Buffer.from(pubSubEvent.data, 'base64').toString())
    : undefined

  console.log('Received emailRequest!')
  console.log(emailRequest)

  const email = {
    to: emailRequest.to,
    from: emailRequest.from,
    subject: emailRequest.subject,
    text: emailRequest.body,
    cc: emailRequest.cc,
    bcc: emailRequest.bcc
  }

  sgMail.send(email).then(() => { console.log('Email sent!') }, () => console.log('Email not sent!'))
}
