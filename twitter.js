const Twitter = require('twitter')

module.exports = (store) => {
  const client = new Twitter({
    consumer_key: process.env.API_KEY,
    consumer_secret: process.env.API_SECRET,
    access_token_key: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
  });

  const stream = client.stream('statuses/sample')
  
  stream.on('data', function(event){
    store.addTweet(event)
  })

  stream.on('error', function(error){
    throw error
  })
}