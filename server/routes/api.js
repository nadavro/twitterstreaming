const express = require('express');
const router = express.Router();
const Twitter = require('twitter');
var Twit = require('twit')
 
var twitterClient = new Twit({
  consumer_key:         '37ggMqn15Qi6tAvPc1mr97sWM',
  consumer_secret:      '0uWQyIdig0oBUBc8nSoztfTf9XyePUed5WR66fFUUWfIrxiBky',
  access_token:         '939408135801987072-0jovBiAHL7YjAvXKutuO87aslZZrHGz',
  access_token_secret:  'ow6ee8OOONnpg5NrPg5UW7Bq43HSj6a9IHzD6EKFUPV7B'
  
})

var tweets = []
var count_positive = 0;
var count_negative = 0;
var count_unknown = 0;
var tweets_hashtags = []
var freqMap = {}; //frequency hashmap of hashtags

/*update the counters of positive,negative or unknown tweets */
function updateCounters(text){
    if (text.indexOf(':)') > -1 || text.indexOf(':-)') > -1){
        count_positive++;
    }
    else if (text.indexOf(':(') > -1 || text.indexOf(':-(') > -1){
        count_negative++;
    }
    else {
        count_unknown++;
    }
}

/*update the hashmap of the hashtags */
function updateHashtagCounter(hashtags){
    for (let i = 0 ; i < hashtags.length; i++){
        hashtag = hashtags[i];
        if (!freqMap[hashtag]) {
            freqMap[hashtag] = 1;
        }
        else{
            freqMap[hashtag] += 1;
        }
    }
}

/* Connecting to the Twitter Streaming API */
var stream = twitterClient.stream('statuses/filter', { filter_level:'low',language:['en'],track: [ 'love', 'valentine' ] })
stream.on('tweet', function(tweet) {
  var text = tweet["text"];
  var hashtags = tweet["entities"]["hashtags"].map(h => h.text);
  updateCounters(text);
  updateHashtagCounter(hashtags);
  var tweet = {
      text:text,
  }
  tweets.push(tweet)
});
stream.on('error', function(error) {
  throw error;
});


/* GET api listing. */
router.get('/', (req, res) => {
  res.send('api works');
});

/* GET sentiment */
router.get('/sentiment', (req, res) => {
    result = {
        "positive tweets ":count_positive,
        "negative tweets":count_negative,
        "unknown tweets":count_unknown
    }
    res.json(result);
});

/*GET top hashtags */
router.get('/top_hashtags',(req, res) => {
    var orderedObjects = Object.keys(freqMap).map(function(key) {
        return [(key), freqMap[key]];
      });
    orderedObjects.sort(function(first, second) {
        return second[1] - first[1];
    });
    var result = {}
    //Return top five hashtags
    for (let i = 0; i < 5; i++){
        result[orderedObjects[i][0]] = orderedObjects[i][1]
    }
    res.json(result);
})

module.exports = router;