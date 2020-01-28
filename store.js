class Tweet{

  constructor({ created_at, text, entities }){

    this.created_at = created_at
    this.timestamp = new Date(created_at).getTime(),
    this.text = text 
    this.hashtags = Tweet.parseHashtags(entities)
    this.domains = Tweet.parseDomains(entities)
    this.photos = Tweet.parsePhotos(entities)
    this.emojis = Tweet.parseEmojis(text)
  }

  has(attr){
    return Array.isArray(this[attr]) && this[attr].length > 0
  } 

  static parseHashtags(entities){

    return entities.hashtags.map( hashtag => hashtag.text) 
  }

  static parseDomains(entities){

    return entities.urls.map( block => block.expanded_url)
  }

  static parsePhotos(entities){

    if(!entities.media) return []
    return entities.media
      .filter( m => m.type == `photo`)
      .map( m => m.display_url)
  }

  static parseEmojis(text){
    if(!text) return []
    return text.match(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g) || []
  }

}

const MAX_TWEETS_IN_MEMORY = 1000
class TweetStore {

  constructor(){
    this.currIndex = -1
    this.tweets = []
    this.emojis = {}
    this.hashtags = {}
    this.domains = {}
    this.photos = {}

    this.totalTweetsProcessed = 0

    this.tweetsWith = {
      hashtags: 0,
      emojis: 0,
      photos: 0,
      domains: 0
    }
  }

  

  updateCounts(tweet){
    this.totalTweetsProcessed++
    if(tweet.has('hashtags')) this.tweetsWith.hashtags++
    if(tweet.has('domains')) this.tweetsWith.domains++
    if(tweet.has('emojis')) this.tweetsWith.emojis++
    if(tweet.has('photos')) this.tweetsWith.photos++
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
    return Math.round(n / this.totalTweetsProcessed * 100)
  }

  addTweet(rawTweet){

    const tweet = new Tweet(rawTweet)

    this.pushTweet(tweet)

    this.updateCounts(tweet)
    
    this.add('hashtags', tweet)
    this.add('domains', tweet)
    this.add('emojis', tweet)
    this.add('photos', tweet)
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

  earliestTweet(){

    if(this.tweets.length < MAX_TWEETS_IN_MEMORY)
      return this.tweets[0]
    else 
      return this.tweets[this.nextIndex()]
  }

  latestTweet(){

    return this.tweets[this.currIndex]
  }

  tweetsPer(unit = 'minute'){

    const n = this.tweets.length
    const sample = Math.min(MAX_TWEETS_IN_MEMORY, n)
    const { timestamp: earliest } = this.earliestTweet()
    const { timestamp: latest } = this.latestTweet()

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

    return arr.reduce((acc, next, i) => (i) ? `${acc}, ${next.name}` : `${next.name}`, ``)
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
  
    return TweetStore.outputTopItems(arr, limit)
  }
}

module.exports = new TweetStore()