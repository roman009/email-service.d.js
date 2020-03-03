const { describe, it } = require('mocha')
const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)
const googleFunction = require('../../index')

describe('processWebRequest', () => {
  let consoleLogSpy, sandbox, collectionStub, pubSubClientStub

  before(() => {
    sandbox = sinon.createSandbox()
    consoleLogSpy = sinon.spy(console, 'log')
    collectionStub = sinon.stub(googleFunction.db, 'collection')
    pubSubClientStub = sinon.stub(googleFunction.pubSubClient, 'topic')
  })
  after(() => {
    consoleLogSpy.restore()
    collectionStub.restore()
    pubSubClientStub.restore()
  })

  it('should create correct list of recipients and send 2 pubsub messages from all request fields', async () => {
    const data = {
      from: 'adasdasdsd@asdasdds.ro',
      to: [
        'sadasdas@asdasdasda.ro',
        'sadasdas@asdasdasda.ro',
        'sadasdas1@sadasdas1.ro'
      ],
      cc: [
        'sadasdas_cc_1@asdasdasdacc1.ro',
        'sadasdas_cc_2@asdasdasdacc2.ro'
      ],
      bcc: [
        'sadasdas_bcc1@asdasdasdabcc1.ro',
        'sadasdas_bcc1@asdasdasdabcc1.ro',
        'sadasdas_bcc2@asdasdasdabcc2.ro',
        'sadasdas_bcc2@asdasdasdabcc2.ro'
      ],
      subject: 'this is the subject',
      body: 'this is the body'
    }

    const pubSubEvent = {
      data: Buffer.from(JSON.stringify(data)).toString('base64')
    }

    const doc = {}
    doc.doc = (email) => {
      const obj = {}
      if (['sadasdas@asdasdasda.ro', 'sadasdas_cc_2@asdasdasdacc2.ro', 'sadasdas_bcc2@asdasdasdabcc2.ro'].includes(email)) {
        obj.get = () => {
          const subObj = {}
          subObj.exists = false

          return subObj
        }
      } else {
        obj.get = () => {
          const subObj = {}
          subObj.exists = true

          return subObj
        }
      }

      return obj
    }
    collectionStub.returns(doc)

    const expectedMessageData = {
      from: 'adasdasdsd@asdasdds.ro',
      subject: 'this is the subject',
      body: 'this is the body',
      to: ['sadasdas@asdasdasda.ro'],
      cc: ['sadasdas_cc_2@asdasdasdacc2.ro'],
      bcc: ['sadasdas_bcc2@asdasdasdabcc2.ro']
    }
    const dataBuffer = Buffer.from(JSON.stringify(expectedMessageData))

    const topic = {
      publish: (data) => {}
    }
    const topicStub = sinon.stub(topic, 'publish').returns(111)
    pubSubClientStub.withArgs(process.env.TOPIC_EMAIL_REQUESTS || 'topic-email-requests').returns(topic)

    await googleFunction.processWebRequest(pubSubEvent, {})

    expect(topicStub).to.have.been.calledOnceWith(dataBuffer)
    expect(consoleLogSpy.calledWith('Received webRequest!')).to.be.true
    expect(consoleLogSpy.calledWith('Processed webRequest!')).to.be.true
    expect(consoleLogSpy.calledWith('Message 111 published.')).to.be.true
    expect(pubSubClientStub).to.have.been.callCount(1)
    topicStub.restore()
  })

  it('should create correct list of recipients and send 1 pubsub messages from a incomplete request', async () => {
    const data = {
      from: 'adasdasdsd@asdasdds.ro',
      to: [
        'sadasdas333@asdasdasda.ro',
        'sadasdas2@asdasdasda.ro'
      ],
      subject: 'this is the subject',
      body: 'this is the body'
    }

    const pubSubEvent = {
      data: Buffer.from(JSON.stringify(data)).toString('base64')
    }

    const doc = {}
    doc.doc = (email) => {
      const obj = {}
      if (['sadasdas333@asdasdasda.ro'].includes(email)) {
        obj.get = () => {
          const subObj = {}
          subObj.exists = false

          return subObj
        }
      } else {
        obj.get = () => {
          const subObj = {}
          subObj.exists = true

          return subObj
        }
      }

      return obj
    }
    collectionStub.returns(doc)

    const expectedMessageData = {
      from: 'adasdasdsd@asdasdds.ro',
      subject: 'this is the subject',
      body: 'this is the body',
      to: ['sadasdas333@asdasdasda.ro'],
      cc: [],
      bcc: []
    }
    const dataBuffer = Buffer.from(JSON.stringify(expectedMessageData))

    const topic = {
      publish: (data) => {}
    }
    const topicStub = sinon.stub(topic, 'publish').returns(111)
    pubSubClientStub.withArgs(process.env.TOPIC_EMAIL_REQUESTS || 'topic-email-requests').returns(topic)

    await googleFunction.processWebRequest(pubSubEvent, {})

    expect(topicStub).to.have.been.calledOnceWith(dataBuffer)
    expect(consoleLogSpy.calledWith('Received webRequest!')).to.be.true
    expect(consoleLogSpy.calledWith('Processed webRequest!')).to.be.true
    expect(consoleLogSpy.calledWith('Message 111 published.')).to.be.true
    topicStub.restore()
  })
})
