import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import axios from 'axios';
import ytdl from 'ytdl-core';
import { transcribe } from 'transcribe-anything';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

const SYSTEM_PROMPT = `You are an AI assistant focused on helping users understand a specific video content.
Your responses should be based ONLY on the information provided in the video transcript and context.
Do not make assumptions or provide information beyond what was explicitly mentioned in the video.
If a question cannot be answered using the video content alone, politely explain this to the user.

Key responsibilities:
1. Answer questions based strictly on the video content
2. Provide timestamps when referencing specific parts of the video
3. Clarify any ambiguities by referring to the exact video content
4. Maintain context continuity throughout the conversation
5. Admit when information is not available in the video

Remember: You are an expert on this specific video content only.`;

async function callLLM(prompt, provider, apiKey, apiUrl) {
  switch (provider) {
    case 'openai':
      const openaiUrl = apiUrl || 'https://api.openai.com/v1/chat/completions';
      const openaiResponse = await axios.post(
        openaiUrl,
        {
          model: 'gpt-4',
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }],
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return openaiResponse.data.choices[0].message.content;

    case 'claude':
      const claudeUrl = apiUrl || 'https://api.anthropic.com/v1/messages';
      const claudeResponse = await axios.post(
        claudeUrl,
        {
          model: 'claude-3-opus-20240229',
          messages: [{ role: 'user', content: `${SYSTEM_PROMPT}\n\n${prompt}` }],
        },
        {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
        }
      );
      return claudeResponse.data.content[0].text;

    case 'ollama':
      const ollamaUrl = apiUrl || 'http://localhost:11434/api/chat';
      const ollamaResponse = await axios.post(
        ollamaUrl,
        {
          model: 'llama2',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt },
          ],
        }
      );
      return ollamaResponse.data.message.content;

    default:
      throw new Error('Unsupported LLM provider');
  }
}

async function getVideoTranscript(videoUrl) {
  try {
    // Get video info
    const videoInfo = await ytdl.getInfo(videoUrl);
    const videoTitle = videoInfo.videoDetails.title;
    
    // Get the audio-only format
    const audioFormat = ytdl.chooseFormat(videoInfo.formats, { 
      quality: 'highestaudio',
      filter: 'audioonly' 
    });
    
    // Download audio and get the buffer
    const audioStream = ytdl.downloadFromInfo(videoInfo, { format: audioFormat });
    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    // Transcribe the audio
    const transcriptionResult = await transcribe(audioBuffer, {
      format: audioFormat.container,
      language: 'auto', // Auto-detect language
      timestamps: true, // Include word-level timestamps
    });

    return {
      title: videoTitle,
      transcript: transcriptionResult.text,
      segments: transcriptionResult.segments,
    };
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe video: ' + error.message);
  }
}

app.post('/api/summarize', async (req, res) => {
  try {
    const { videoUrl, llmProvider, apiKey, apiUrl } = req.body;

    if (!videoUrl) {
      throw new Error('Video URL is required');
    }

    // Get video transcript
    const { title, transcript, segments } = await getVideoTranscript(videoUrl);

    // Generate summary using LLM
    const summaryPrompt = `
      Please analyze this video transcript and provide:
      1. A concise summary
      2. Key moments with timestamps (use the provided segments)
      3. Step-by-step instructions of the main points
      
      Video Title: ${title}
      
      Transcript with timestamps:
      ${segments.map(s => `[${s.start}] ${s.text}`).join('\n')}
      
      Format the response as JSON with the following structure:
      {
        "title": "${title}",
        "summary": "Comprehensive summary",
        "keyMoments": [{"timestamp": "MM:SS", "description": "Description"}],
        "steps": ["Step 1", "Step 2", ...]
      }
    `;

    const llmResponse = await callLLM(summaryPrompt, llmProvider, apiKey, apiUrl);
    const summaryData = JSON.parse(llmResponse);

    res.json({
      success: true,
      data: {
        id: Math.random().toString(36).substr(2, 9),
        ...summaryData,
        transcript,
      },
    });
  } catch (error) {
    console.error('Summarization error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to summarize video',
    });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { question, videoContext, llmProvider, apiKey, apiUrl } = req.body;
    const prompt = `${SYSTEM_PROMPT}\n\nVideo Context:\n${videoContext}\n\nQuestion: ${question}`;
    const answer = await callLLM(prompt, llmProvider, apiKey, apiUrl);
    
    res.json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get answer',
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});