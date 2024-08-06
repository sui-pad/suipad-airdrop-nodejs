import express from 'express';
import {isAuthenticated, sendResponse, sendSuccessData} from "./base_app.js";
import {client} from "./redisClient.js";
import {getConnection, releaseConnection} from "./db.js";
import twitterClient from "./twitterClient.js";
import {twitterApiConfig} from "../config/config.js";
import { TwitterApi } from 'twitter-api-v2';

const twitter_app = express();
twitter_app.get('/oauth_url', isAuthenticated,async (req, res) => {
    let connection;
    try {
        connection=await getConnection();
        const addr = req.session.wallet.addr;
        let [results,]=await connection.query("select * from sys_users where wallet_address=?",[addr]);
        if (results.length>0 && results[0].twitter_id){
            console.log(`${addr} had connect twitter ${results[0].twitter_id}`);
            return sendSuccessData(res, {  });
        }
        const { url, oauth_token, oauth_token_secret } = await twitterClient.generateAuthLink(twitterApiConfig.callBackUrl);
        await client.set("oauth_token:" + oauth_token, oauth_token_secret, "EX", 300);
        await client.set("oauth_token_wallet:" + oauth_token, addr, "EX", 300);
        // 发送 URL 给客户端
        const authUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${oauth_token}`;
        return sendSuccessData(res, { authUrl });
    } catch (error) {
        console.error('/oauth_url:', error);
        return sendResponse(res, 500, 500, 'get oauthUrl error');
    }finally {
        if (connection){
            releaseConnection(connection);
        }
    }
});

twitter_app.get('/xoauth', async (req, res) => {
    const oauthToken = req.query.oauth_token;
    const oauthVerifier = req.query.oauth_verifier;
    if (!oauthToken || !oauthVerifier) {
        return sendResponse(res, 400, 400, 'Missing required parameters');
    }
    let connection;
    try {
        connection=await getConnection();
        const oauthTokenSecret = await client.get("oauth_token:" + oauthToken);
        const getAccessTokenClient = new TwitterApi({
            appKey: twitterApiConfig.apiKey,
            appSecret: twitterApiConfig.apiKeySecret,
            accessToken:oauthToken,
            accessSecret:oauthTokenSecret
        });
        // 使用 oauthToken 和 oauthVerifier 交换访问令牌
        const { accessToken, accessSecret } = await getAccessTokenClient.login(oauthVerifier);
        // 创建一个新的 Twitter 客户端实例以使用访问令牌
        const userClient = new TwitterApi({
            appKey: twitterApiConfig.apiKey,
            appSecret: twitterApiConfig.apiKeySecret,
            accessToken,
            accessSecret,
        });
        // 获取用户信息
        const userInfo = await userClient.v1.verifyCredentials();
        // {
        //     id: 1751825501986160600,
        //     id_str: '1751825501986160640',
        //     name: 'Jackson',
        //     screen_name: 'Jackson76928643',
        //     location: '',
        //     description: '',
        // }
        const userId = userInfo.id_str;

        let message="success";
        const walletAddr=await client.get("oauth_token_wallet:" + oauthToken);
        let [results,]=await connection.query("select * from sys_users where wallet_address=?",[walletAddr]);
        if (results.length>0 && results[0].twitter_id){
            message=`${addr} had connect twitter ${results[0].twitter_id}`
            console.log(message);
        }else {
            [results,]=await connection.query("select * from sys_users where twitter_id=?",[userId]);
            if (results.length>0 && results[0].twitter_id){
                message=`${userId} has connected by wallet ${results[0].wallet_address},new wallet:${walletAddr}`
                console.log(message);
            }else {
                console.log(`${walletAddr} connect twitter success ${userId}`);
                await connection.query("update sys_users set twitter_id=? where wallet_address=?",[userId,walletAddr]);
            }
        }
        const redirectUrl = twitterApiConfig.redirectUrl+message;
        res.redirect(302, redirectUrl);
    } catch (error) {
        console.error('/callback= ', error);
        return sendResponse(res, 500, 500, 'error');
    }finally {
        if (connection){
            releaseConnection(connection);
        }
    }
});

export default twitter_app;