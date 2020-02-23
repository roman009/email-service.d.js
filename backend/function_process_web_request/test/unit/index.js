const { describe, it } = require('mocha')
const { expect } = require('chai')
const sinon = require('sinon')
const googleFunction = require('../../index')

describe('uniqueEmails', () => {
  it('should return an unique array of emails', async () => {
    const emails = ['a@a.com', 'b@a.com', 'c@a.com', 'b@a.com']
    const expectedResult = ['a@a.com', 'b@a.com', 'c@a.com']
    const result = googleFunction.uniqueEmails(emails)
    expect(result).to.eql(expectedResult)
  })
})

describe('blockedEmails', () => {
  it('should return an array of emails that are not blocked', async () => {
    const emails = ['a@a.com', 'b@a.com', 'c@a.com', 'd@a.com']
    const collectionStub = sinon.stub(googleFunction.db, 'collection')
    const doc = {}
    doc.doc = (email) => {
      const obj = {}
      if (['a@a.com', 'b@a.com', 'c@a.com'].includes(email)) {
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
    const expectedResult = ['a@a.com', 'b@a.com', 'c@a.com']
    const result = await googleFunction.blockedEmails(emails)
    expect(result).to.eql(expectedResult)
  })
})
