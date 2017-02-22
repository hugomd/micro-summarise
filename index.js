const fetch = require('node-fetch')
const { getArticle } = require('article-parser')
const retext = require('retext')
const keyword = require('retext-keywords')
const nlcsttostring = require('nlcst-to-string')
const { parse } = require('url')
const { send } = require('micro')

const getKeywords = async (data) => {
  try {
    let { err, file } = await retext().use(keyword).process(data, (err, file) => {
      return file.data.keywords.map(key => nlcsttostring(key.matches[0].node))
    })
  } catch(err) {
    console.log(err)
    return err
  }
}

module.exports = async (req, res) => {
  // Input: URLs
  // Output: Summary
  const { query: { url } } = parse(req.url, true)
  if (!url) return send(res, 401, { message: 'Please supply an URL to be scraped in the url query parameter.' })

  let statusCode, response, data, keywords, summary
  try {
    response = await fetch(url)
    data = await response.text()
    keywords = await getKeywords(data)
    summary = await getArticle(data)
    statusCode = 200
  } catch (err) {
    console.log(err)
  }

  send(res, statusCode, { summary, keywords })
}
