const Tweet = require('./tweet')

const MAX_TWEETS_IN_MEMORY = 1000
class TweetStore {

  constructor(){
    
    this.currIndex = -1
    this.tweets = []
    this.emojis = {}
    this.hashtags = {}
    this.domains = {}
    this.photos = {}

    this.totalTweetsReceived = 0

    this.tweetsWith = {
      hashtags: 0,
      emojis: 0,
      photos: 0,
      domains: 0
    }
  }

  updateCounts(tweet){

    this.totalTweetsReceived++

    if(tweet.has('hashtags')) this.tweetsWith.hashtags++
    if(tweet.has('domains')) this.tweetsWith.domains++
    if(tweet.has('emojis')) this.tweetsWith.emojis++
    if(tweet.has('photos')) this.tweetsWith.photos++

    this.add('hashtags', tweet)
    this.add('domains', tweet)
    this.add('emojis', tweet)
    this.add('photos', tweet)
  }
 
  nextIndex(){

    return (this.currIndex + 1) % MAX_TWEETS_IN_MEMORY 
  }

  pushTweet(tweet){

    this.currIndex = this.nextIndex()
    if(this.tweets.length < MAX_TWEETS_IN_MEMORY){
      this.tweets.push(tweet)
    } else {
      this.tweets[this.currIndex] = tweet
    }
  }

  percentTweetsWith(type){

    return this.percent(this.tweetsWith[type])
  }

  percent(n){

    return Math.round(n / this.totalTweetsReceived * 100)
  }

  addTweet(rawTweet){

    const tweet = new Tweet(rawTweet)

    this.pushTweet(tweet)

    this.updateCounts(tweet)
  }

  add(type, tweet){

    tweet[type].map(key => {
      if(this[type][key]){
        this[type][key] += 1
      } else {
        this[type][key] = 1
      }
    })
  }

  earliestTweetTimestamp(){

    let tweet
    if(this.tweets.length < MAX_TWEETS_IN_MEMORY)
      tweet = this.tweets[0]
    else 
      tweet = this.tweets[this.nextIndex()]

    return tweet.timestamp
  }

  latestTweetTimestamp(){

    return this.tweets[this.currIndex].timestamp
  }

  tweetsPer(unit = 'minute'){

    const n = this.tweets.length
    const sample = Math.min(MAX_TWEETS_IN_MEMORY, n)
    const earliest = this.earliestTweetTimestamp()
    const latest = this.latestTweetTimestamp()

    let timeframe

    switch(unit){
      case 'hour':
        timeframe = 1000 * 60 * 60
        break;
      case 'second':
        timeframe = 1000
        break;
      case 'minute':
      default:
        timeframe = 1000 * 60
    }
    
    return Math.round( timeframe * sample / (latest - earliest) )
  }

  static getTopItems(arr){

    let n = Object.keys(arr).length
    let top = new Array(n)
    let i = 0

    for (let name in arr){
      top[i] = { name, count: arr[name] }
      i++
    }

    // sort descending
    return top.sort(function(a,b){ return b.count - a.count })
  }

  top(type, limit = 10){

    let arr = TweetStore.getTopItems(this[type])

    return arr
      .slice(0, limit)
      .map(item=>item.name)
  }
}

module.exports = new TweetStore()