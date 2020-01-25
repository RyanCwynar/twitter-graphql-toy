
const EMOJIS = require('emoji-datasource-twitter')
class TweetStore {
  constructor(){
    this.tweets = []
    this.emojis = []
    this.hashtags = {}
    this.URLs = []
    this.photoURLs = []
  }

  static filterIncoming({ created_at, text }){
    return {
      created_at,
      timestamp: new Date(created_at).getTime(),
      text,
    }
  }
  static parseHashtags(tweet){
    return tweet.text.split(' ').filter(str=>str.match(/^#.*/))
  }
  addTweet(rawTweet){
    const tweet = TweetStore.filterIncoming(rawTweet)
    this.tweets.push(tweet)

    this.addHashtags(tweet)
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

  totalTweets(){
    return this.tweets.length
  }

  static outputTags(arr, limit){
    arr = arr.slice(0, limit)
    return arr.reduce((acc, next, i) => (i) ? `${acc}, ${next.tag} - ${next.count}` : `${next.tag} - ${next.count}`, ``)
  }

  topHashtags(limit = 10){
    let n = Object.keys(this.hashtags).length
    let top = new Array(n)
    let i = 0
    for (let tag in this.hashtags){
      top[i] = { tag, count: this.hashtags[tag] }
      i++
    }
    top.sort(function(a,b){ return b.count - a.count })
  
    return TweetStore.outputTags(top, limit)
  }
}

module.exports = new TweetStore()