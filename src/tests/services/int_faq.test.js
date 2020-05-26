const mongoose = require('mongoose')
const faqService = require('../../services/faq.js')
const setupModels = require('../../util/setupModels.js')
const faq = require('../../constants/faq.js')
const dbName = 'test_int_faq'
const CON_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}

faq.documents = [{
  q: '1q',
  a: '1a',
  t: '1t'
}, {
  q: '2q',
  a: '2a',
  t: '2t'
}, {
  q: '3q',
  a: '3a',
  t: '3t'
}]

describe('Int::models/FilteredFormat', function () {
  /** @type {import('mongoose').Connection} */
  let con
  /** @type {import('mongoose').Collection} */
  let collection
  beforeAll(async function () {
    con = await mongoose.createConnection(`mongodb://localhost:27017/${dbName}`, CON_OPTIONS)
    await setupModels(con)
    collection = con.db.collection('faq_hits')
  })
  beforeEach(async () => {
    await con.db.dropDatabase()
  })
  describe('hit', () => {
    it('adds 1 to hits', async () => {
      const question = 'w4ry65etu'
      await collection.insertOne({
        _id: question,
        hits: 7
      })
      await faqService.hit(question)
      const found = await collection.findOne({
        _id: question
      })
      expect(found.hits).toEqual(8)
    })
  })
  describe('getHits', function () {
    it('returns a map of hits for every question', async () => {
      const docs = [{
        _id: 'a',
        hits: 300
      }, {
        _id: 'b',
        hits: 44
      }, {
        _id: 'c',
        hits: 99
      }]
      await collection.insertMany(docs)
      const expectedMap = new Map()
      for (const doc of faq.documents) {
        expectedMap.set(doc.q, 0)
      }
      for (const doc of docs) {
        expectedMap.set(doc._id, doc.hits)
      }
      const hits = await faqService.getHits()
      expect(hits).toEqual(expectedMap)
    })
  })
  describe('get', function () {
    it('returns the sorted list of questions', async () => {
      const docs = [{
        _id: faq.documents[0].q,
        hits: 44
      }, {
        _id: faq.documents[1].q,
        hits: 300
      }, {
        _id: faq.documents[2].q,
        hits: 99
      }]
      await collection.insertMany(docs)
      const sortedDocuments = await faqService.get()
      expect(sortedDocuments[0]).toEqual(faq.documents[1])
      expect(sortedDocuments[1]).toEqual(faq.documents[2])
      expect(sortedDocuments[2]).toEqual(faq.documents[0])
    })
  })
  afterAll(async function () {
    await con.db.dropDatabase()
    await con.close()
  })
})
