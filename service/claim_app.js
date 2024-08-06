import express from 'express';
import {getConnection, releaseConnection} from "./db.js";
import {isAuthenticated, sendError, sendResponse, sendSuccessData} from "./base_app.js";
import {claimSign} from "./claim/claimservice.js";
const claim_app = express();
claim_app.get('/info',isAuthenticated, async (req,res) => {
    let connection;
    try{
        connection=await getConnection();
        const addr=req.session.wallet.addr;
        const data={};
        data.totalAirdrop=0;
        data.totalRealse=0;
        data.balance=0;
        data.freeze=0;
        data.claimed=0;
        data.logo="";
        data.tokenName="";
        const [lbs,]=await connection.query("select * from wallet_lock_balance where wallet_address=?",[addr]);
        if (lbs.length>0){
            const lb=lbs[0];
            data.totalAirdrop=lb.total_amount;
            data.totalRealse=lb.realse_amount;
        }
        const [cbs,]=await connection.query("select * from wallet_claim_balance where wallet_address=?",[addr]);
        if (cbs.length>0){
            const cb=cbs[0];
            data.balance=cb.balance;
            data.freeze=cb.freeze;
            data.claimed=cb.claimed;
        }
        return sendSuccessData(res,data);
    }catch (error){
        console.log("airdrop_list error:",error);
        return sendError(res);
    }finally {
        if (connection){
            releaseConnection(connection);
        }
    }
});

claim_app.get('/signature', isAuthenticated, async (req, res) => {
    try {
        const walletAddress=req.session.wallet.addr;
        console.log("wallet claim:",walletAddress);
        const result=await claimSign(walletAddress);
        sendSuccessData(res,  result);
    } catch (err) {
        console.error("/info:", err);
        sendResponse(res, 500, 500, err);
    }
})

export default claim_app;