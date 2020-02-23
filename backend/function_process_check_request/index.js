const sgClient = require('@sendgrid/client');

sgClient.setApiKey(process.env.SENDGRID_API_KEY)
exports.sgClient = sgClient

exports.processCheckRequest = async (pubSubEvent, context) => {
  console.log('Received checkRequest!')


}
