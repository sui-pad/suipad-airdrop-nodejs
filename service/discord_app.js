import express from 'express';
import {isAuthenticated, sendResponse, sendSuccessData} from "./base_app.js";
import {client} from "./redisClient.js";
import {getConnection, releaseConnection} from "./db.js";
import {discordCallback, discordCallbackUrl, getDiscordOauthUrl} from "./discordService.js";
import {twitterApiConfig} from "../config/config.js";

const discord_app = express();
discord_app.get('/oauth_url', isAuthenticated,async (req, res) => {
    try {
        const addr=req.session.wallet.addr;
        const url=discordCallbackUrl;
        const authUrl = getDiscordOauthUrl(url);
        return sendSuccessData(res, { authUrl });
    } catch (error) {
        console.error('/oauth_url:', error);
        return sendResponse(res, 500, 500, 'get oauthUrl error');
    }
});

discord_app.get('/doauth', isAuthenticated,async (req, res) => {
    const oauthCode=req.query.code;
    const addr=req.session.wallet.addr;
    console.log(`doauth ${oauthCode} ${addr}`)
    await discordCallback(oauthCode,addr);
    const redirectUrl = twitterApiConfig.redirectUrl+"success";
    res.redirect(302, redirectUrl);
});

export default discord_app;