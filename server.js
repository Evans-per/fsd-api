require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const OPENUV_API_KEY = process.env.OPENUV_API_KEY;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', 'views');

// Open Trivia Database API URL
const TRIVIA_API = 'https://opentdb.com/api.php';

// Home Route
app.get('/', (req, res) => {
  res.render('index');
});

// Quiz Page Route
app.get('/quiz', (req, res) => {
  res.render('quiz');
});

// Results Page Route
app.get('/result', (req, res) => {
  res.render('result');
});

// Get Quiz Questions from API
app.get('/api/quiz', async (req, res) => {
  try {
    const { amount = 10, category = '', difficulty = '' } = req.query;
    
    let url = `${TRIVIA_API}?amount=${amount}`;
    if (category) url += `&category=${category}`;
    if (difficulty) url += `&difficulty=${difficulty}`;
    
    const response = await axios.get(url);
    
    if (response.data.response_code === 0) {
      // Decode HTML entities in questions and answers
      const questions = response.data.results.map(q => ({
        question: decodeHtmlEntity(q.question),
        correct_answer: decodeHtmlEntity(q.correct_answer),
        incorrect_answers: q.incorrect_answers.map(a => decodeHtmlEntity(a)),
        difficulty: q.difficulty,
        category: q.category
      }));
      
      res.json({ success: true, questions });
    } else {
      res.json({ success: false, message: 'Failed to fetch questions' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Categories
app.get('/api/categories', async (req, res) => {
  try {
    const response = await axios.get('https://opentdb.com/api_category.php');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to decode HTML entities
function decodeHtmlEntity(str) {
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&apos;': "'"
  };
  return str.replace(/&[a-z]+;/gi, match => entities[match] || match);
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
