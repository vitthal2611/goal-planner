// Production AI suggestions API using OpenAI

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, type } = req.body;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: `${prompt}\n\nReturn only a JSON array of 3 suggestions in this format:\n${getFormatExample(type)}`
        }],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const suggestions = JSON.parse(data.choices[0].message.content);

    res.status(200).json({ suggestions });
  } catch (error) {
    console.error('AI service error:', error);
    
    // Fallback suggestions for production reliability
    const fallbackSuggestions = getFallbackSuggestions(type);
    res.status(200).json({ suggestions: fallbackSuggestions });
  }
}

function getFormatExample(type) {
  if (type === 'goal') {
    return '[{"title": "Read 24 books", "target": 24, "unit": "books"}]';
  } else if (type === 'habit') {
    return '[{"name": "Read for 30 minutes", "trigger": "After morning coffee", "time": "08:00", "location": "Living room"}]';
  } else if (type === 'trigger') {
    return '[{"trigger": "After morning coffee"}]';
  }
}

function getFallbackSuggestions(type) {
  if (type === 'goal') {
    return [
      { title: 'Achieve personal growth', target: 12, unit: 'milestones' },
      { title: 'Build healthy habits', target: 365, unit: 'days' },
      { title: 'Improve skills', target: 100, unit: 'hours' }
    ];
  } else if (type === 'habit') {
    return [
      { name: 'Daily practice', trigger: 'After breakfast', time: '08:30', location: 'Home' },
      { name: 'Evening routine', trigger: 'Before bed', time: '21:00', location: 'Bedroom' },
      { name: 'Morning activity', trigger: 'After waking up', time: '07:00', location: 'Living room' }
    ];
  } else if (type === 'trigger') {
    return [
      { trigger: 'After morning coffee' },
      { trigger: 'Before breakfast' },
      { trigger: 'After work' }
    ];
  }
  return [];
}