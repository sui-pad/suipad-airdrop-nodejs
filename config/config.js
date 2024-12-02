const domain="uat-airdrop.devbase.cloud";
const crosHost=['http://airdrop.jyczg888.uk','https://airdrop.jyczg888.uk','https://airdrop.suipad.xyz', 'https://uat-airdrop.devbase.cloud'];
const twitterApiConfig={
    apiKey:"I8eJa09GgTTYzrsPBIYJlS5Pl",
    apiKeySecret:"i5GoNVaeatyRQ5eaOLTxFYuapKLmFWAxEuHE65AmkNl6MFdcNM",
    accessToken:"1788375243670618112-3K2j0bqwqdmu7DT3dpNeREWwsv6M5r",
    accessTokenSecret:"3ihgf1DmhiNiFfblPKZERUQWtkUG0aYnXBQXoukocflFy",
    callBackUrl:"https://apiairdrop.suipad.xyz/twitter/xoauth",
    redirectUrl:"https://airdrop.suipad.xyz/oauth?message="
}
const database= {
    host: '127.0.0.1',
    port:'3306',
    user: 'root',
    password: 'app123456',
    database: 'suipad_airdrop',
    maxIdle: 500,
    connectionLimit:500
}

const claimConfig={
    rpc:"https://rpc.merlinchain.io",
    contract:"0xB6608DB27857346A3bd6cf38E950112BAd0feB7A",//正式：0xB6608DB27857346A3bd6cf38E950112BAd0feB7A 测试：0xA5014C0bd2830A5BDcC550cEc42624162A9A9F83
    rewardToken:"0x09401c470a76Ec07512EEDDEF5477BE74bac2338",//正式：0x09401c470a76Ec07512EEDDEF5477BE74bac2338  测试:0x73757A02AC091F17f6B6eD0038f137ef16AEBf8d
    signer:"",
    typeHash: "0x146a9f16879841a54bebb809d47c9113e212be3339b5ad65c0e60f2be4467dff",
    domainSeparator:"0x202f7d7e5759e2d2b51589d7a5659cd16fb26d3c768a0af51eaf02fb090c634b",
    claimStartTimestamp:1713355200000,
    tokenDecimals:18,
    abi: [],
}
const tgConfig={
    "connectUrl":"https://t.me/SuipadAirdropTest_bot?start="
}
export {twitterApiConfig, database,claimConfig,tgConfig,domain,crosHost}
