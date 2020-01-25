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
    return text.match(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g) || []
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