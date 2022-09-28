const fetch = require("node-fetch");
const cheerio = require("cheerio");

require("dotenv").config();

const { TwitterApi } = require('twitter-api-v2')

const twitterClient = new TwitterApi(process.env.BEARER_TOKEN);
const readOnlyClient = twitterClient.readOnly;

async function getTweet(tweetURL) {
  const data = tweetURL.match(/status\/\d+\?/g)
  const userID = Array.isArray(data) && data[0].replace(/status\/|\?/g,'')

  if (!userID) {
    return
  }

  const result = await readOnlyClient.v2.singleTweet(userID, {
    expansions: [
      'author_id',
      'attachments.media_keys',
    ],
    'media.fields': [
      'url',
    ],
  })

  const tweet = {
    username: result.includes && Array.isArray(result.includes.users) && result.includes.users[0] && result.includes.users[0].username,
    image: result.includes && Array.isArray(result.includes.media) && result.includes.media[0] && result.includes.media[0].url,
    description: result.data && result.data.text
  }

  return tweet
}

async function getInstagramPost(url) {
    const response = await fetch(url);
    const data = await response.text();

    const $ = cheerio.load(data);

    const username = $('[name="twitter:title"]')
      .attr("content")
      .match(/@.+\)/gi)[0]
      .replace(/@|\)/g,'')

    const description = $('[name="description"]').attr("content")
    const image = $('[name="twitter:image"]').attr("content");

    const post = {
      username,
      image,
      description,
    };

    return post
}

async function getData(url) {
  if (url.includes('twitter.com')) {
    return getTweet(url)
  }
  
  if (url.includes('instagram.com')) {
    return getInstagramPost(url)
  }
}

exports.handler = async (event, context) => {
  try {
    const userURL = event.multiValueQueryStringParameters.url[0]
    console.log('userURL', userURL)
    if (!userURL) {
      return {
        status: 401
      }
    }

    const data = await getData(userURL)
    if (!data) {
      return {
        status: 401
      }
    }

    const nft = {
      name: `NFT created by ${data.username} at iJS 2022`,
      description: data.description,
      image: data.image,
    }
    console.log(JSON.stringify(nft, null, 2))

    return {
      statusCode: 200,
      body: Buffer.from(JSON.stringify(nft)).toString("base64"),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed" }),
    };
  }
};


if (require.main === module) {
  // const url = 'https://twitter.com/jaumint/status/1574890911095562243?s=20&t=ObS6zPCPaNk1Z_Y9NKix8A'
  const url = "https://www.instagram.com/p/CiWPJSGsQHb/?utm_source=ig_web_copy_link"

  getData(url)
    .then(response => {
      console.log('response')
      console.log(JSON.stringify(response, null, 2))
    })
}
