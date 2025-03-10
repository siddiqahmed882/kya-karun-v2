require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use(express.static('public'));

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Ensure API key is set
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OpenAI API Key is missing! Set it in the .env file.');
  process.exit(1);
}
console.log('✅ OpenAI API Key Loaded: **** (hidden for security)');

// Endpoint for career suggestion
app.post('/api/career-suggestion', async (req, res) => {
  const userAnswers = req.body.answers;

  // Validate user input
  if (!userAnswers || !Array.isArray(userAnswers) || userAnswers.length === 0) {
    return res.status(400).json({ error: 'Invalid or missing answers' });
  }

  const prompt = `Based on the following Q&A responses, suggest the top 5 career paths for this individual. 
  Please format your response in markdown with the following structure:
  
  # Career Suggestions
  
  ## 1. [Career Name]
  - Reason 1
  - Reason 2
  - Key skills match
  
  [Continue same format for remaining 4 careers]
  
  User's responses: ${JSON.stringify(userAnswers)}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    });

    // Check if response is valid
    const careerSuggestion = response.choices[0]?.message?.content?.trim() || 'No suggestion found';
    console.log('🎯 Career Suggestion Generated');

    res.json({ career: careerSuggestion });
  } catch (error) {
    console.error('❌ OpenAI API Error:', error.message);
    res.status(500).json({ error: 'Error fetching career suggestion from OpenAI' });
  }
});

// Start server on a dynamic port (default 5000)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
