require('dotenv').config()
const { ApolloServer, gql } = require('apollo-server')
const store = require('./store')

require('./twitter')(store)

const typeDefs = gql`

  type Query{
    latestTweet: String
    totalTweetsReceived: Int
    tweetsPer: Timeframes
    top: TrendingOccurencesOf
    percentageContaining: PercentageTweetsContaining
  }
  
  type Timeframes{
    hour: Int
    minute: Int
    second: Int
  }

  type TrendingOccurencesOf{
    emojis(limit: Int): [String]
    hashtags(limit: Int): [String]
    domains(limit: Int): [String]
    photos(limit: Int): [String]
  }

  type PercentageTweetsContaining{
    emojis: Float
    domains: Float
    photos: Float
  }
`

const resolvers = {
  Query: {
    latestTweet: (root, args, store) => store.tweets[store.currIndex].text,
    totalTweetsReceived: (root, args, store) => store.totalTweetsReceived,
    tweetsPer: () => ({
      hour: (args, store) => store.tweetsPer('hour'),
      minute: (args, store) => store.tweetsPer('minute'),
      second: (args, store) => store.tweetsPer('second'),
    }),
    top: () => ({

      emojis: (args, store) => store.top('emojis', args.limit),
      hashtags: (args, store) => store.top('hashtags', args.limit),
      domains: (args, store) => store.top('domains', args.limit),
      photos: (args, store) => store.top('photos', args.limit),
    }),
    percentageContaining: () => ({

      emojis: (args, store) => store.percentTweetsWith('emojis'),
      domains: (args, store) => store.percentTweetsWith('domains'),
      photos: (args, store) => store.percentTweetsWith('photos'),
    }),
  },    
}



const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
  context: store
})

server.listen(process.env.PORT).then(() => {
  console.log(`Listening on ${process.env.PORT}`) 
})