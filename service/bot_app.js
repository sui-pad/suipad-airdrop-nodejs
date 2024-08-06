import express from 'express';
import {isAuthenticated, sendResponse, sendSuccessData} from "./base_app.js";
import {tgConfig} from "../config/config.js";

const bot_app = express();
bot_app.get('/connect_tg_bot_url', isAuthenticated, async (req, res) => {
    try {
        const addr = req.session.wallet.addr;
        return sendSuccessData(res, {url:tgConfig.connectUrl+addr} );
    } catch (err) {
        console.error('/get_tg_bot_url= ', err);
        sendResponse(res, 500, 500, err);
    }
});

export default bot_app;