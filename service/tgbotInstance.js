// botInstance.js
import TelegramBot from 'node-telegram-bot-api';
const tg_token = "7189667637:AAHglDLx-lzuPKfjd8f6k5aSw4vYHiZD_I0";
let bot;

function initBot() {
    if (!bot) {
        bot = new TelegramBot(tg_token, { polling: true });
    }
    return bot;
}

function getBot() {
    return bot || initBot();
}

export {getBot}
