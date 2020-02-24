const { describe, it } = require('mocha')
const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const chaiHttp = require('chai-http')
require('dotenv').config()
const server = require('../../server')
const mailController = require('../../controller/mail_controller')

chai.use(chaiHttp)

describe('api server', () => {
  it('should return 401 http status for code unauthenticated requests', () => {
    chai.request(server.app).post('/api/mail/send').end((err, res) => {
      expect(res.status).to.be.equal(401)
    })
  })

  it('should return 422 http status for invalid requests', () => {
    chai.request(server.app).post('/api/mail/send').set('X-TOKEN', process.env.AUTH_TOKEN).end((err, res) => {
      expect(res.status).to.be.equal(422)
    })
  })

  it('should return 200 http status for valid requests', () => {
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

    const pubSubClientStub = sinon.stub(mailController.pubSubClient, 'topic')

    chai.request(server.app)
      .post('/api/mail/send')
      .set('X-TOKEN', process.env.AUTH_TOKEN)
      .send(data)
      .end((err, res) => {
        expect(res.status).to.be.equal(200)
        expect(pubSubClientStub).to.have.been.callCount(1)
      })

    pubSubClientStub.restore()
  })
})

describe('health check', () => {
  it('should return 200 http status', () => {
    chai.request(server.app)
      .get('/health/check')
      .end((err, res) => {
        expect(res.status).to.be.equal(200)
      })
  })
})
