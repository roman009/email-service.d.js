const { describe, it } = require('mocha')
const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)
const googleFunction = require('../../index')

describe('processCheckRequest', () => {
  it('should check the sengrid API for blocked emails and save them to the store if they are not present', async () => {
    const consoleLogSpy = sinon.spy(console, 'log')
    const response = {}
    response.body = [
      {
        created: 1443651125,
        email: 'testemail1@test.com',
        reason: '550 5.1.1 The email account that you tried to reach does not exist.',
        status: '5.1.1'
      },
      {
        created: 1433800303,
        email: 'testemail2@testing.com',
        reason: '550 5.1.1 <testemail2@testing.com>: Recipient address rejected: User unknown in virtual alias table',
        status: '5.1.1'
      }
    ]
    const sgClientStub = sinon.stub(googleFunction.sgClient, 'request')
    sgClientStub.onCall(0).resolves([response, {}])
    sgClientStub.onCall(1).resolves([{}, {}])
    sgClientStub.onCall(2).resolves([{}, {}])
    sgClientStub.onCall(3).resolves([{}, {}])

    const collectionStub = sinon.stub(googleFunction.db, 'collection')
    const doc = {}
    const newDoc = {}
    newDoc.get = () => {
      const subObj = {}
      subObj.exists = false

      return subObj
    }
    newDoc.set = (data) => {}
    let newDocStub = sinon.stub(newDoc, 'set')
    doc.doc = (email) => {
      if (['testemail1@test.com'].includes(email)) {
        return newDoc
      }
      const obj = {}
      obj.get = () => {
        const subObj = {}
        subObj.exists = true

        return subObj
      }
      return obj
    }
    collectionStub.returns(doc)

    await googleFunction.processCheckRequest({}, {})

    expect(sgClientStub).to.have.been.callCount(4)
    // expect(newDocStub.called).to.be.true
    expect(consoleLogSpy.calledWith('Received checkRequest!')).to.be.true
    expect(consoleLogSpy.calledWith('Email address added to block list!')).to.be.true

    consoleLogSpy.restore()
    sgClientStub.restore()
    collectionStub.restore()
  })
})
