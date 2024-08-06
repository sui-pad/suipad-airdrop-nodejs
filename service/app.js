import express from 'express';
import cors from 'cors';
import user_app from "./user_app.js";
import {client} from "./redisClient.js";
import session from 'express-session';
import RedisStore from 'connect-redis';
import task_app from "./task_app.js";
import twitter_app from "./twitter_app.js";
import bot_app from "./bot_app.js";
import {crosHost, domain} from "../config/config.js";
import claim_app from "./claim_app.js";
import discord_app from "./discord_app.js";

const app = express();
const port = 9000;

app.use(express.json());
app.use(cors({
    origin: crosHost, // 允许域名
    methods: ['GET', 'POST'],
    credentials: true // 启用支持凭证
}));

// 配置会话中间件
app.use(session({
    store: new RedisStore({ client: client }),
    secret: 'airdrop_suupad', // 使用环境变量来设置
    saveUninitialized: false,
    resave: false,
    name: 'airdrop', // 自定义cookie的名称
    cookie: {
        domain: domain,
        maxAge: 3600000 // 会话有效期，单位为毫秒，此处设置为1小时
    }
}));

app.use("/user",user_app);
app.use("/task",task_app);
app.use("/twitter",twitter_app);
app.use("/bot",bot_app);
app.use("/claim",claim_app);
app.use("/discord",discord_app);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});