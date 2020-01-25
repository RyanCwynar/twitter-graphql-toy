require('dotenv').config()
const { ApolloServer, gql } = require('apollo-server')
const store = require('./store')

require('./twitter')(store)

const typeDefs = gql`

  type Query{
    totalTweetsReceived: Int
    tweetsPer: TweetTimeWindow
    trending: TrendingOccurencesOf
    percentageContaining: PercentageTweetsContaining
  }

  type TrendingOccurencesOf{
    emojis(limit: Int): String
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
    trending: () => ({

      emojis: (args, store) => store.topEmojis(args.limit),
      hashtags: (args, store) => store.topHashtags(args.limit),
      domains: (args, store) => store.topDomains(args.limit),
    }),
    percentageContaining: () => ({

      emojis: (args, store) => store.percent(store.tweetsWithEmojis),
      domains: (args, store) => store.percent(store.tweetsWithDomains),
      photos: (args, store) => store.percent(store.tweetsWithPhotos),
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