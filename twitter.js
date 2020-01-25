const Twitter = require('twitter')
const fs = require('fs')
const path = require('path')

module.exports = (store) => {
  const client = new Twitter({
    consumer_key: process.env.API_KEY,
    consumer_secret: process.env.API_SECRET,
    access_token_key: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
  });

  const stream = client.stream('statuses/sample')
  
  // const writeStream = fs.createWriteStream(path.resolve(__dirname, 'test', 'mocks', 'sample-tweets.json'))

  // let i = 0
  // writeStream.write('[')
  stream.on('data', function(event){
    store.addTweet(event)

    // if(i < 500){
    //   writeStream.write(JSON.stringify(event))
    //   writeStream.write(',')
    // } else {
    //   writeStream.write(']')
    //   writeStream.end()
    // }
    // i++
  })

  stream.on('error', function(error){
    throw error
  })
}