// server/controllers/newsController.js

const axios = require('axios');
const { parseStringPromise } = require('xml2js');

// URL RSS-стрічки новин Міністерства оборони
// ПРАВИЛЬНО
const RSS_URL = 'https://armyinform.com.ua/feed/';

// @desc    Отримати останні новини з сайту МОУ
// @route   GET /api/news
// @access  Public
const getMoDNews = async (req, res) => {
  try {
    // 1. Отримуємо XML-дані з RSS-стрічки
    const { data: xmlData } = await axios.get(RSS_URL);

    // 2. Парсимо XML в JavaScript об'єкт
    const parsedData = await parseStringPromise(xmlData);
    
    // 3. Витягуємо масив новин (зазвичай він лежить у rss.channel[0].item)
    const newsItems = parsedData.rss.channel[0].item;

    // 4. Форматуємо дані у зручний для нас вигляд і беремо перші 10
    const formattedNews = newsItems.slice(0, 10).map(item => ({
      title: item.title[0],
      link: item.link[0],
      pubDate: item.pubDate[0],
      description: item.description[0],
    }));

    res.json(formattedNews);
  } catch (error) {
    console.error('Помилка при отриманні новин:', error);
    res.status(500).send('Не вдалося завантажити новини');
  }
};

module.exports = {
  getMoDNews,
};