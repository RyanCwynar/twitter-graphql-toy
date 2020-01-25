require('dotenv').config()
const Twitter = require('twitter')
const { ApolloServer, gql } = require('apollo-server')
const store = require('./store')

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

const typeDefs = gql`

  type Query{
    totalTweetsReceived: Int
    tweetsPer: TweetTimeWindow
    top: TopOccurencesOf
    percentageContaining: PercentageTweetsContaining
  }

  type TopOccurencesOf{
    emojis: String
    hashtags: String
    domains: String
  }

  type TweetTimeWindow{
    hour: Int
    minute: Int
    second: Int
  }

  type PercentageTweetsContaining{
    emojis: Float
    URLs: Float
    photoURLs: Float
  }
`
const resolvers = {
  Query: {
    totalTweetsReceived: (root, args, store) => {
      return store.totalTweets()
    },
    tweetsPer: {
      hour: () => {},
      minute: () => {},
      second: () => {},
    },
    top: {
      emojis: () => {},
      hashtags: () => {},
      domains: () => {},
    },
    percentageContaining: {
      emojis: () => {},
      URLs: () => {},
      photoURLs: () => {},
    },
  },    
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
  context: store
})

server.listen(process.env.PORT).then(() => { console.log(`Listening on ${process.env.PORT}`) })