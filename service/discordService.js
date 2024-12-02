import axios from 'axios';
import{ Client, GatewayIntentBits } from "discord.js";
import {getConnection, releaseConnection} from "./db.js";
import {client} from "./redisClient.js";
const CLIENT_ID = '1217111281106944111'
const CLIENT_SECRET = 'zdq1cDQ6SV3mcb3N_MnqjCDwSiF3jnV2'
const DISCORD_TOKEN_URL = 'https://discord.com/api/oauth2/token'
const DISCORD_API_URL = 'https://discord.com/api/users/@me'
const discordCallbackUrl="https%3A%2F%2Fapiairdrop.suipad.xyz%2Fdiscord%2Fdoauth"
const discordCallbackUrlNotEncode="https://apiairdrop.suipad.xyz/discord/doauth"
const botOauthUrl="https://discord.com/oauth2/authorize?client_id=1217111281106944111&permissions=8&scope=bot";
let discord;

async function initDiscordClient(){
    discord = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
        ]
    });
    await discord.login("");
}
function getDiscordOauthUrl(redirect){
    const Oauth_URI=`https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${redirect}&scope=identify`
    return Oauth_URI;
}

async function discordCallback(code,walletAddress){
    let connection;
    try {
        connection=await getConnection();
        // 使用授权码获取access token
        const tokenResponse = await axios.post(DISCORD_TOKEN_URL, new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: discordCallbackUrlNotEncode
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // 使用access token调用Discord API获取用户信息
        const userResponse = await axios.get(DISCORD_API_URL, {
            headers: {
                Authorization: `Bearer ${tokenResponse.data.access_token}`
            }
        });

        /**
         * discord user_info: {
         *   id: '966718811359281212',
         *   username: 'wangyueban',
         *   avatar: '68ad9f7e3c22a28f93bce1fa4ad63252',
         *   discriminator: '0',
         *   public_flags: 0,
         *   premium_type: 0,
         *   flags: 0,
         *   banner: null,
         *   accent_color: null,
         *   global_name: '王月半',
         *   avatar_decoration_data: null,
         *   banner_color: null,
         *   mfa_enabled: false,
         *   locale: 'zh-CN'
         * }
         */
        // 输出用户信息
        // console.log("discord user_info:",userResponse.data)
        if (userResponse.data.id){
            const userDiscordId=userResponse.data.id;
            const username=userResponse.data.username;
            connection.query("update users set dc_id=?,dc_user_name=? where wallet_address=? and dc_id is null",[userDiscordId,username,walletAddress]);
        }
    } catch (error) {
        console.error('Failed to exchange Discord code for token:', error);
    }finally {
        if (connection){
            releaseConnection(connection)
        }
    }

}

async function checkHasJoinDcServer( addr, serverId) {
    let connection;
    try{
        connection=await getConnection();
        let [resultRows,] = await connection.query("select * from users where wallet_address = ?", [addr]);
        if (resultRows.length === 0) {
            return 0;
        }
        const dc_id=resultRows[0].dc_id;
        if (dc_id) {
            [resultRows,]=await connection.query("select * from dc_group_member where dc_id=? and dc_group_id=?",[dc_id,serverId]);
            if(resultRows.length>0){
                return 1;
            }
            const guild = await discord.guilds.fetch(serverId);
            const members = await guild.members.fetch();
            for (const m of members) {
                // console.log(m[1].user.id);
                // console.log(m[1].user.username);
                if (m[1].user.id===dc_id){
                    console.log("已加入discord userName:",m[1].user.username);
                    await connection.query("insert into dc_group_member(wallet_address,dc_group_id,dc_id)values(?,?,?)",[addr,serverId,m[1].user.id]);
                    return 1;
                }
            }
            return 2;
        }else {
            return 0;
        }
    }finally {
        if (connection){
            releaseConnection(connection);
        }
    }
    return 0;
}

await initDiscordClient();
// await checkDiscordMembers("966718811359281212")
// await discordCallback("l6Kq4tsxwo4cFLk9KEByllTAMtOLNp")
// console.log(getDiscordOauthUrl(discordCallbackUrl+"w3c"));
export {getDiscordOauthUrl,discordCallback,checkHasJoinDcServer,discordCallbackUrl}