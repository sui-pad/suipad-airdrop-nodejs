import express from 'express';
import Web3 from 'web3';
import {isAuthenticated, sendResponse, sendSuccessData, sendSuccessResponse} from "./base_app.js";
import {getConnection, releaseConnection} from "./db.js";
import * as crypto from "crypto";
const user_app = express();


const web3 = new Web3(new Web3.providers.HttpProvider("https://bsc-mainnet.rpcfast.com?api_key=kY4GucHPC1X1z9TA8KCVZs7TuTnr6ZDijsbMoqjC7lBh0vBWuHoYjAEPN3wKpjy8"));
user_app.get('/login', async (req ,res) => {
    let connection;
    try {
        const addr = req.query.addr;
        const sign = req.query.sign;
        const code = req.query.code;

        // 钱包签名校验
        const message = 'Welcome to SuipadAirdrop:\n' + addr;
        const signingAddress = web3.eth.accounts.recover(message, sign);
        const valid = signingAddress.toLowerCase() === addr.toLowerCase();
        if (!valid) {
            return sendResponse(res, 400, 400, "Invalid signature.");
        }

        // 钱包db查询
        connection = await getConnection();
        const [resultRows, ] = await connection.query("select * from sys_users where wallet_address = ?", [addr]);
        if (resultRows.length > 0) {
            req.session.wallet = { addr };
            return sendSuccessResponse(res);
        }

        let fatherWallet="";
        if (code) {
            const [codeRows, ] = await connection.query("select * from sys_users where invite_code = ?", [code]);
            if (codeRows.length > 0) {
                fatherWallet = codeRows[0].wallet_address;
            }
        }
        const inviteCode=generateInviteCode();
        // 创建钱包
        await connection.query("insert into users(wallet_address, father_wallet_address,invite_code,chain) values(?, ?,?,'evm')", [addr, fatherWallet,inviteCode]);
        req.session.wallet = { addr };
        return sendSuccessResponse(res);
    } catch (err) {
        console.error("login error", err);
        return sendResponse(res, 500, 500, err);
    } finally {
        if (connection) {
            releaseConnection(connection);
        }
    }
});

user_app.get('/sui_login', async (req ,res) => {
    let connection;
    try {
        const addr = req.query.addr;
        const sign = req.query.sign;
        const code = req.query.code;

        // 钱包签名校验
        // const message = 'Welcome to SuipadAirdrop:\n' + addr;
        // const signingAddress = web3.eth.accounts.recover(message, sign);
        // const valid = signingAddress.toLowerCase() === addr.toLowerCase();
        // if (!valid) {
        //     return sendResponse(res, 400, 400, "Invalid signature.");
        // }

        // 钱包db查询
        connection = await getConnection();
        const [resultRows, ] = await connection.query("select * from sys_users where wallet_address = ?", [addr]);
        if (resultRows.length > 0) {
            req.session.wallet = { addr };
            return sendSuccessResponse(res);
        }

        let fatherWallet="";
        if (code) {
            const [codeRows, ] = await connection.query("select * from sys_users where invite_code = ?", [code]);
            if (codeRows.length > 0) {
                fatherWallet = codeRows[0].wallet_address;
            }
        }
        const inviteCode=generateInviteCode();
        // 创建钱包
        await connection.query("insert into users(wallet_address, father_wallet_address,invite_code,chain) values(?, ?,?,'sui')", [addr, fatherWallet,inviteCode]);
        req.session.wallet = { addr };
        return sendSuccessResponse(res);
    } catch (err) {
        console.error("login error", err);
        return sendResponse(res, 500, 500, err);
    } finally {
        if (connection) {
            releaseConnection(connection);
        }
    }
});
function generateInviteCode() {
    let timestampPart = Date.now().toString(36);
    let randomPart = crypto.randomBytes(2).toString('hex'); // 生成安全的随机字节并转换为十六进制
    return timestampPart+ randomPart;
}

user_app.get('/logout', (req, res) => {
    try {
        if (req.session) {
            // 销毁整个会话
            req.session.destroy((err) => {
                if (err) {
                 return    sendResponse(res, 500, 500, 'err0r');
                } else {
                    return sendSuccessResponse(res);
                }
            });
        } else {
           return sendSuccessResponse(res);
        }
    } catch (error) {
        console.error("logout",error);
        return sendResponse(res, 500, 500, 'err0r');
    }
});

user_app.get('/check_login',isAuthenticated, async (req ,res) => {
    const addr = req.session.wallet.addr;
    return sendSuccessData(res,{walletAddress:addr});
});

user_app.get('/info',isAuthenticated, async (req ,res) => {
    let connection;
    try{
        connection=await getConnection();
        const addr = req.session.wallet.addr;
        const jobId = req.query.jobId;
        let [resultRows, ] = await connection.query("select * from sys_users where wallet_address = ?", [addr]);
        let inviteCode;
        if (resultRows.length > 0) {
            inviteCode=resultRows[0].invite_code;
        }
        [resultRows, ] = await connection.query("select count(1) count from sys_users where father_wallet_address = ?", [addr]);
        return sendSuccessData(res,{walletAddress:addr,inviteCode,inviteCount:resultRows[0].count});
    }finally {
        if (connection){
            releaseConnection(connection);
        }
    }
});

// console.log("code:",generateInviteCode());
export default user_app;