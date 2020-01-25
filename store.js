
const EMOJIS = require('emoji-datasource-twitter')

const HAS_DOMAIN = 'hasDomain'
const HAS_PHOTO = 'hasPhoto'
const HAS_EMOJIS = 'hasEmojis'
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

  get hasHashtags(){
    return this.hashtags.length > 0
  }

  get [HAS_DOMAIN](){
    return this.domains.length > 0
  }

  get [HAS_PHOTO](){
    return this.photos.length > 0
  }

  get [HAS_EMOJIS](){
    return this.emojis.length > 0
  }

  static parseHashtags(entities){

    return entities.hashtags.map( tag => tag.text) 
  }

  static parseDomains(entities){

    return entities.urls.map( block => block.expanded_url)
  }

  static parsePhotos(entities){

    if(!entities.media) return []
    return entities.media
      .filter( m =>m.type == `photo`)
      .map( m => m.media_url_https || m.media_url)
  }

  static parseEmojis(text){
    if(!text) return []
    return text.match(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g) || []
  }

  static count(tweets, attr = 'hasDomain'){
    return tweets.reduce( (count, tweet) => {
      if(tweet[attr])
        count++
      return count
    }, 0)
  }
}
class TweetStore {

  constructor(){
    this.lastIndex = 0
    this.tweets = []
    this.emojis = {}
    this.hashtags = {}
    this.domains = {}
  }

  get tweetsWithDomains(){
    return Tweet.count(this.tweets, HAS_DOMAIN)
  }

  get tweetsWithPhotos(){
    return Tweet.count(this.tweets, HAS_PHOTO)
  }

  get tweetsWithEmojis(){
    return Tweet.count(this.tweets, HAS_EMOJIS)
  }
 
  _pushTweet(tweet){
    this.nextIndex = this.nextIndex + 1 % 10000
    if(this.totalTweets() < 10000){
      this.tweets.push(tweet)
    } else {
      this.tweets[this.nextIndex] = tweet
    }
  }

  percent(n){
    return Math.round(n / this.totalTweets() * 100)
  }

  addTweet(rawTweet){

    const tweet = new Tweet(rawTweet)

    this._pushTweet(tweet)

    this.addHashtags(tweet)
    this.addDomains(tweet)
    this.addEmojis(tweet)
  }

  addHashtags(tweet){

    tweet.hashtags.map(tag => {
      if(this.hashtags[tag]){
        this.hashtags[tag] += 1
      } else {
        this.hashtags[tag] = 1
      }
    })
  }

  addDomains(tweet){

    tweet.domains.map(domain => {
      if(this.domains[domain]){
        this.domains[domain] += 1
      } else {
        this.domains[domain] = 1
      }
    })
  }

  addEmojis(tweet){
    tweet.emojis.map(key => {
      if(this.emojis[key]){
        this.emojis[key] += 1
      } else {
        this.emojis[key] = 1
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

  topHashtags(limit = 10){

    let arr = TweetStore.getTopItems(this.hashtags)
  
    return TweetStore.outputTopItems(arr, limit)
  }

  topDomains(limit = 10){

    let arr = TweetStore.getTopItems(this.domains)
  
    return TweetStore.outputTopItems(arr, limit)
  }

  topEmojis(limit = 10){
    
    let arr = TweetStore.getTopItems(this.emojis)
  
    return TweetStore.outputTopItems(arr, limit)
  }
}

module.exports = new TweetStore()