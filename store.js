
class TweetStore {
  constructor(){
    this.tweets = []
  }

  static filterIncoming({created_at, text}){
    return {
      created_at,
      timestamp: new Date(created_at).getTime(),
      text,
    }
  }

  addTweet(rawTweet){
    this.tweets.push(TweetStore.filterIncoming(rawTweet))
  }

  totalTweets(){
    return this.tweets.length
  }
}

module.exports = new TweetStore()