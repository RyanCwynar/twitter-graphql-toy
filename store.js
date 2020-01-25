
const EMOJIS = require('emoji-datasource-twitter')
class TweetStore {

  constructor(){
    this.tweets = []
    this.emojis = []
    this.hashtags = {}
    this.domains = []
    this.photoURLs = []

    this.tweetsWith = {
      domains: 0,
      emojis: 0,
      photoURLs: 0
    }
  }

  static filterIncoming({ created_at, text }){

    return {
      created_at,
      timestamp: new Date(created_at).getTime(),
      text,
    }
  }
  
  static parseHashtags(tweet){

    return tweet.text.split(' ').filter(str => str.match(/^#.*/))
  }

  static parseDomains(tweet){

    return tweet.text.split(' ').filter(str=>str.match(/(https?:\/\/[^\s]+)/))
  }

  percentTweetsWith(type = 'domains'){
    let n = (this.tweetsWith[type]) ? this.tweetsWith[type] : 0
    return Math.round(n / this.totalTweets() * 100)
  }

  addTweet(rawTweet){

    const tweet = TweetStore.filterIncoming(rawTweet)
    this.tweets.push(tweet)

    this.addHashtags(tweet)
    this.addDomains(tweet)
  }

  addHashtags(tweet){

    const tags = TweetStore.parseHashtags(tweet)
    tags.map(tag => {
      if(this.hashtags[tag]){
        this.hashtags[tag] += 1
      } else {
        this.hashtags[tag] = 1
      }
    })
  }

  addDomains(tweet){

    const domains = TweetStore.parseDomains(tweet)

    if(domains.length > 0) this.tweetsWith.domains++

    domains.map(domain => {
      if(this.domains[domain]){
        this.domains[domain] += 1
      } else {
        this.domains[domain] = 1
      }
    })
  }

  totalTweets(){

    return this.tweets.length
  }

  tweetsPer(unit = 'minute'){
    const n = this.totalTweets()
    const sample = Math.min(1000, n)
    const earliest = this.tweets[Math.max(0, n - 1000)].timestamp
    const latest = this.tweets[n - 1].timestamp

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

  static outputTopItems(arr, limit){
    arr = arr.slice(0, limit)

    // Output: #Example - 5, #Another - 3, #StillMore - 1 ...
    return arr.reduce((acc, next, i) => (i) ? `${acc}, ${next.name} - ${next.count}` : `${next.name} - ${next.count}`, ``)
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

  topHashtags(limit = 10){

    let arr = TweetStore.getTopItems(this.hashtags)
  
    return TweetStore.outputTopItems(arr, limit)
  }

  topDomains(limit = 10){

    let arr = TweetStore.getTopItems(this.domains)
  
    return TweetStore.outputTopItems(arr, limit)
  }
}

module.exports = new TweetStore()