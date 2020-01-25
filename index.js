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
    domains(limit: Int): String
  }

  type TweetTimeWindow{
    hour: Int
    minute: Int
    second: Int
  }

  type PercentageTweetsContaining{
    emojis: Float
    domains: Float
    photos: Float
  }
`

const resolvers = {
  Query: {
    totalTweetsReceived: (root, args, store) => store.totalTweets(),
    tweetsPer: () => ({

        hour:   (args, store) => store.tweetsPer('hour'),
        minute: (args, store) => store.tweetsPer('minute'),
        second: (args, store) => store.tweetsPer('second'),
    }), 
    top: () => ({

      emojis: () => {},
      hashtags: (args, store) => store.topHashtags(args.limit),
      domains: (args, store) => store.topDomains(args.limit),
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