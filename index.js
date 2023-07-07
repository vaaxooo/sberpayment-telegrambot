require('dotenv-flow').config()
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Токен вашего Telegram-бота
const token = process.env.TELEGRAM_TOKEN;

// Создаем экземпляр Telegram-бота
const bot = new TelegramBot(token, { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Привет! Для начала работы введите сумму, реферальный код и название сайта через пробел. (Пример: 1000 1234567890 site.com)');
});

// Обработчик входящего сообщения
bot.onText(/^(?!\/).+$/, (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // Разделяем текст сообщения на сумму и реферальный код
  const [amount, referralCode, site] = messageText.split(' ');

  // Проверяем, что введены и сумма, и реферальный код
  if (!amount || !referralCode || !site) {
    bot.sendMessage(chatId, 'Пожалуйста, введите сумму, реферальный код и название сайта через пробел. (Пример: 1000 1234567890 site.com)');
    return;
  }
  const uuid = uuidv4();
  // Отправляем данные на сервер
  sendDatatoServer(amount, referralCode, uuid, site)
    .then(() => {
        let message = `Данные успешно отправлены на сервер.\n\n`
        message += `Ссылка на оплату: https://payment.ros-belet.ru/?orderId=${uuid}`
      bot.sendMessage(chatId, message);
    })
    .catch((error) => {
      console.error('Ошибка при отправке данных на сервер:', error);
      bot.sendMessage(chatId, 'Произошла ошибка при отправке данных на сервер.');
    });
});

// Функция для отправки данных на сервер
async function sendDatatoServer(amount, referal, uuid, site) {

  // Здесь необходимо указать URL сервера, на который будут отправлены данные
  const serverUrl = process.env.API + '/public/create-transaction';

  // Формируем данные для отправки
  const data = {
    uuid,
    amount,
    referal,
    site
  };

  // Отправляем POST-запрос на сервер
  const response = await axios.post(serverUrl, data);

  // Обрабатываем ответ сервера
  if (response.status === 200) {
    console.log('Данные успешно отправлены на сервер.');
  } else {
    throw new Error('Ошибка при отправке данных на сервер.');
  }
}
