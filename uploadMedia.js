// functions/uploadMedia.js
const fetch = require('node-fetch'); // You need to install this if using Node.js

exports.handler = async function (event, context) {
  const body = JSON.parse(event.body);

  const { imageBase64, title, tags } = body;

  const twitterBearerToken = 'AAAAAAAAAAAAAAAAAAAAAGFOxgEAAAAANLmn9vXHYgwuEauzmC84rB1FwAc%3DrFUDgTiIGE7jZlRMQGWJqemD3tJF74MhCEX8SI3bdU2s84nrjL'; // Set your Bearer token here

  try {
    // Step 1: Upload media to Twitter
    const mediaResponse = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${twitterBearerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        media_data: imageBase64,
      }),
    });

    const mediaData = await mediaResponse.json();

    if (!mediaData.media_id_string) {
      throw new Error('Media upload failed');
    }

    // Step 2: Post the tweet
    const tweetResponse = await fetch('https://api.twitter.com/1.1/statuses/update.json', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${twitterBearerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: `${title} ${tags}`,
        media_ids: mediaData.media_id_string,
      }),
    });

    const tweetData = await tweetResponse.json();

    if (tweetData.id_str) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Tweet posted successfully' }),
      };
    }

    throw new Error('Tweet posting failed');
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
