const { describe, it } = require('mocha')
const { expect } = require('chai')
const sinon = require('sinon')
const googleFunction = require('../../index')

describe('processResponse', () => {
  it('should do nothing if body is undefined or empty', async () => {
    const consoleLogSpy = sinon.spy(console, 'log')
    await googleFunction.processResponse([{}, {}])
    expect(consoleLogSpy.called).to.be.false
    consoleLogSpy.restore()
  })

  it('should add the email address to the blocked list if it is not there', async () => {
    const consoleLogSpy = sinon.spy(console, 'log')
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
    await googleFunction.processResponse([response, {}])

    expect(newDocStub.called).to.be.true
    expect(consoleLogSpy.calledWith('Email address added to block list!')).to.be.true

    consoleLogSpy.restore()
    collectionStub.restore()
  })
})