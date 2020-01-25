require('dotenv').config()
const { ApolloServer, gql } = require('apollo-server')
const store = require('./store')

require('./twitter')(store)

const typeDefs = gql`

  type Query{
    totalTweetsReceived: Int
    tweetsPer: TweetTimeWindow
    top: TopOccurencesOf
    percentageContaining: PercentageTweetsContaining
  }

  type TopOccurencesOf{
    emojis: String
    hashtags(limit: Int): String
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
    totalTweetsReceived: (root, args, store) => store.totalTweets(),
    tweetsPer: () => ({

        hour: () => {},
        minute: () => {},
        second: () => {},
    }), 
    top: () => ({

      emojis: () => {},
      hashtags: (args, store) => store.topHashtags(args.limit),
      domains: () => "https://example.com",
    }),
    percentageContaining: () => ({

      emojis: () => {},
      URLs: () => {},
      photoURLs: () => {},
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