const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = 'YOUR_TELEGRAM_TOKEN';
const bot = new TelegramBot(token, {polling: true});

bot.onText(/^\/attack (.+) (\d+) (.+)$/, (msg, match) => {
  const chatId = msg.chat.id;
  const url = match[1];
  const time = parseInt(match[2]);
  const method = match[3];

  if (method === 'tls') {
    attackWithTLS(url, time, chatId);
  } else if (method === 'browser') {
    attackWithBrowser(url, time, chatId);
  } else {
    bot.sendMessage(chatId, 'Invalid attack method. Please choose either "tls" or "browser".');
  }
});

async function attackWithTLS(url, time, chatId) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      },
      maxRedirects: 0,
      validateStatus: null
    });

    if (response.status === 302) {
      bot.sendMessage(chatId, `Attack started on ${url} using TLS method for ${time} seconds.`);
      setTimeout(() => {
        bot.sendMessage(chatId, `Attack on ${url} using TLS method has ended.`);
      }, time * 1000);
    } else {
      bot.sendMessage(chatId, `Failed to start attack on ${url} using TLS method.`);
    }
  } catch (error) {
    bot.sendMessage(chatId, `An error occurred during the attack on ${url} using TLS method: ${error.message}`);
  }
}

async function attackWithBrowser(url, time, chatId) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      },
      maxRedirects: 0,
      validateStatus: null
    });

    if (response.status === 200) {
      bot.sendMessage(chatId, `Attack started on ${url} using browser method for ${time} seconds.`);
      setTimeout(() => {
        bot.sendMessage(chatId, `Attack on ${url} using browser method has ended.`);
      }, time * 1000);
    } else {
      bot.sendMessage(chatId, `Failed to start attack on ${url} using browser method.`);
    }
  } catch (error) {
    bot.sendMessage(chatId, `An error occurred during the attack on ${url} using browser method: ${error.message}`);
  }
}