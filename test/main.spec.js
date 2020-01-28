const assert = require('assert')

const TWEETS = require('./mocks/sample-tweets.json')
const store = require('../store')

describe("Twitter API exercise", function(){
  before(function(){
    for (let i = 0; i < 100; i++){
      store.addTweet(TWEETS[i])
    }
  })
  
  it("should track total tweets received", function(done){
    assert.equal(store.totalTweetsProcessed, 100)
    done()
  })

  it("should increment when adding tweets", function(done){
    const total = store.totalTweetsProcessed

    store.addTweet(TWEETS[105])

    assert.equal(store.totalTweetsProcessed, total + 1)
    done()
  })

  it("should track average tweets per hour/min/sec", function(done){
    let perHour = store.tweetsPer('hour'), 
        perMinute = store.tweetsPer('minute'), 
        perSecond = store.tweetsPer('second')
    
    assert.ok( perHour > perMinute, 'Should be more tweets per hour than per minute')
    assert.ok( perMinute > perSecond, 'Should be more tweets per minute than per second')
    assert.ok( perSecond < 100, 'the sample stream averages ~50 per second') // otherwise something is wrong
    done()
  })

  it("should identify most frequent emojis", function(done){
    assert.ok(store.top('emojis'), 'Should be a comma separated list of emojis')
    done()
  })

  it("should identify trending hashtags", function(done){
    assert.ok(store.top('hashtags'), 'Should be a comma separated list of hashtags')
    done()
  })

  it("should identify trending domains", function(done){
    assert.ok(store.top('domains'));
    done()
  })

  it("should calculate percentage of tweets that contain emojis", function(done){
    assert.ok(store.percentTweetsWith('emojis'))
    done()
  })

  it("should calculate percentage of tweets which contain a domain", function(done){
    assert.ok(store.percentTweetsWith('domains'))
    done()
  })

  it("should calculate percentage of tweets which contain a photo", function(done){
    assert.ok(store.percentTweetsWith('photos'))
    done()
  })
})