const domain=".suipad.xyz";
const crosHost=['https://airdrop.suipad.xyz'];
const twitterApiConfig={
    apiKey:"I8eJa09GgTTYzrsPBIYJlS5Pl",
    apiKeySecret:"i5GoNVaeatyRQ5eaOLTxFYuapKLmFWAxEuHE65AmkNl6MFdcNM",
    accessToken:"1788375243670618112-3K2j0bqwqdmu7DT3dpNeREWwsv6M5r",
    accessTokenSecret:"3ihgf1DmhiNiFfblPKZERUQWtkUG0aYnXBQXoukocflFy",
    callBackUrl:"https://apiairdrop.suipad.xyz/twitter/xoauth",
    redirectUrl:"https://airdrop.suipad.xyz/oauth?message="
}
const database= {
    host: '',//54.179.222.54  172.26.1.184
    port:'',
    user: '',
    password: '',
    database: '',
    maxIdle: 10,
    connectionLimit:500
}

const tgConfig={
    "connectUrl":"https://t.me/SuipadAirdropTest_bot?start="
}
export {twitterApiConfig, database,claimConfig,tgConfig,domain,crosHost}
