// Simple API test to verify Perplexity works

const testPerplexityAPI = async () => {
  const apiKey = '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';
  const endpoint = 'https://api.perplexity.ai/chat/completions';
  
  const requestBody = {
    model: 'sonar-pro',
    messages: [
      {
        role: 'user',
        content: 'Say hello'
      }
    ],
    max_tokens: 100
  };
  
  console.log('Testing Perplexity API...');
  console.log('Request:', JSON.stringify(requestBody, null, 2));
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('Response Status:', response.status, response.statusText);
    
    const data = await response.json();
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ API Test PASSED');
      console.log('Content:', data.choices?.[0]?.message?.content);
    } else {
      console.log('\n❌ API Test FAILED');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testPerplexityAPI();
