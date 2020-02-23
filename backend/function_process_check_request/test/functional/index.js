const { describe, it } = require('mocha')
const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)
const googleFunction = require('../../index')

describe('processCheckRequest', () => {
  let consoleLogSpy, sandbox
  before(() => {
    sandbox = sinon.createSandbox()
    consoleLogSpy = sinon.spy(console, 'log')
  })
  after(() => {
    consoleLogSpy.restore()
  })

  it('should check the sengrid API for blocked emails and save them to the store if they are not present', async () => {
    const sgClientStub = sinon.stub(googleFunction.sgClient, 'request').resolves(true)
    const processResponseStub = sinon.stub(googleFunction, 'processResponse')

    await googleFunction.processCheckRequest({}, {})

    expect(sgClientStub).to.have.been.callCount(4)
    expect(processResponseStub).to.have.been.callCount(4)
    expect(consoleLogSpy.calledWith('Received checkRequest!')).to.be.true

    sgClientStub.restore()
    processResponseStub.restore()
  })
})
