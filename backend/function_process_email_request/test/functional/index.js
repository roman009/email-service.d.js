const { describe, it } = require('mocha')
const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)
const googleFunction = require('../../index')

describe('processEmailRequest', () => {
  const data = {
    from: 'adasdasdsd@asdasdds.ro',
    to: ['sadasdas@asdasdasda.ro'],
    cc: ['sadasdas_cc_1@asdasdasdacc1.ro'],
    bcc: ['sadasdas_bcc1@asdasdasdabcc1.ro'],
    subject: 'this is the subject',
    body: 'this is the body'
  }

  const pubSubEvent = {
    data: Buffer.from(JSON.stringify(data)).toString('base64')
  }

  let consoleLogSpy, sandbox
  before(() => {
    sandbox = sinon.createSandbox()
    consoleLogSpy = sinon.spy(console, 'log')
  })
  after(() => {
    consoleLogSpy.restore()
  })

  it('should call the sengrid API to send one email with success', async () => {
    const sgMailStub = sinon.stub(googleFunction.sgMail, 'send').resolves(1)

    const email = {
      to: data.to,
      from: data.from,
      subject: data.subject,
      text: data.body,
      cc: data.cc,
      bcc: data.bcc
    }

    await googleFunction.processEmailRequest(pubSubEvent, {})

    expect(sgMailStub).to.have.been.calledOnceWith(email)
    expect(consoleLogSpy.calledWith('Received emailRequest!')).to.be.true
    expect(consoleLogSpy.calledWith('Email sent!')).to.be.true
    sgMailStub.restore()
  })

  it('should call the sengrid API to send one email with error', async () => {
    const sgMailStub = sinon.stub(googleFunction.sgMail, 'send').rejects('Error')

    await googleFunction.processEmailRequest(pubSubEvent, {})

    expect(consoleLogSpy.calledWith('Received emailRequest!')).to.be.true
    expect(consoleLogSpy.calledWith('Email not sent!')).to.be.true
    sgMailStub.restore()
  })
})
