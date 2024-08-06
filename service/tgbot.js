import { getConnection, releaseConnection } from "./db.js";
import TelegramBot from 'node-telegram-bot-api';
import {getBot} from "./tgbotInstance.js";

async function checkHasJoinTgGroup(wallet_address, groupId) {
    let connection;
    try {
        connection = await getConnection();
        let [results,] = await connection.query("SELECT * FROM tg_group_member WHERE wallet_address = ? AND tg_group_id = ?", [wallet_address, groupId]);
        if (results.length > 0) {
            return 1;
        }

        [results,] = await connection.query("SELECT * FROM sys_users WHERE wallet_address = ?", [wallet_address]);
        console.log(`${wallet_address} tg_id: ${results[0].tg_id}`)
        if (results.length > 0 && results[0].tg_id) {
            const tg_id = results[0].tg_id;
            const memberRow = await getBot().getChatMember(groupId, tg_id);
            console.log(`groupId:${groupId} member count:${await getBot().getChatMemberCount(groupId)} status:${memberRow.status}`)
            if (memberRow.status!=='left') {
                await connection.query("INSERT INTO tg_group_member (wallet_address, tg_group_id) VALUES (?, ?)", [wallet_address, groupId]);
                return 1;
            }else {
                return 2;
            }
        }

    } catch (error) {
        console.error("Error checking Telegram group membership:", error);
        throw error; // 重新抛出错误，让调用者处理
    } finally {
        if (connection) {
            releaseConnection(connection);
        }
    }
    return 0;
}

getBot().on('message', async (msg) => {
    let connection;
    try{
        connection=await getConnection();
        if (msg.text && msg.text.includes("/start")){
            console.log("start msg:",msg);
        }else {
            // console.log("other bot msg:",msg);
            return
        }
        const walletAddress = msg.text.replace("/start ", "");
        let [results,]=await connection.query("select * from sys_users where wallet_address=?",[walletAddress]);
        if (results.length===0){
            console.log("wallet not exists:",walletAddress);
            return
        }
        if (results.length>0 && results[0].tg_id){
            console.log(`${walletAddress} had connect tg ${results[0].tg_id}`);
            return
        }
        const tg_id = msg.chat.id.toString();
        console.log(`${walletAddress} connect tg ${tg_id} success`);
        await connection.query("update sys_users set tg_id=? where wallet_address=?",[tg_id,walletAddress]);
    }finally {
        if (connection){
            releaseConnection(connection)
        }
    }
});

// async function getBotUpdate(){
//     console.log("getBotUpdate....");
//     while (true){
//         const botupdatemsg= await getBot().getUpdates();
//         for (let i=0;i<botupdatemsg.length;i++){
//             console.log("botupdatemsg:",botupdatemsg[i]);
//         }
//     }
// }
// getBotUpdate();

export {checkHasJoinTgGroup}