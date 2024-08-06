import { TwitterApi } from 'twitter-api-v2';
import {twitterApiConfig} from "../config/config.js";

const twitterClient = new TwitterApi({
    appKey: twitterApiConfig.apiKey,
    appSecret: twitterApiConfig.apiKeySecret,
    accessToken: twitterApiConfig.accessToken,
    accessSecret: twitterApiConfig.accessTokenSecret,
});

export default twitterClient;