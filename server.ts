import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

const ttsCache = new Map<string, { audioBase64: string; mimeType: string }>();
const MAX_CACHE_ENTRIES = 120;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      ttsConfigured: Boolean(getGeminiClient()),
    });
  });

  app.post('/api/tts', async (req, res) => {
    const rawText = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    const rawStyle =
      typeof req.body?.style === 'string'
        ? req.body.style.trim().slice(0, 160)
        : 'Clear, warm, well-paced computer science instructor explaining visually with natural pauses';

    if (!rawText) {
      res.status(400).json({ error: 'Narration text is required.' });
      return;
    }

    if (rawText.length > 2500) {
      res.status(400).json({ error: 'Narration text exceeds 2500 character limit.' });
      return;
    }

    const cacheKey = `${rawStyle}::${rawText}`;
    const cached = ttsCache.get(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error:
          'GEMINI_API_KEY is not configured in Settings > Secrets. Switch to Browser Voice or configure GEMINI_API_KEY to enable Gemini AI narration.',
        code: 'MISSING_API_KEY',
      });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: rawText,
                speechMetadata: {
                  style: rawStyle,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      const base64Audio = part?.inlineData?.data;
      const mimeType = part?.inlineData?.mimeType || 'audio/wav';

      if (!base64Audio) {
        res.status(502).json({
          error: 'Gemini TTS returned an empty audio payload.',
          code: 'EMPTY_AUDIO',
        });
        return;
      }

      const payload = { audioBase64: base64Audio, mimeType };
      if (ttsCache.size >= MAX_CACHE_ENTRIES) {
        const oldestKey = ttsCache.keys().next().value;
        if (oldestKey) ttsCache.delete(oldestKey);
      }
      ttsCache.set(cacheKey, payload);

      res.json(payload);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Upstream Gemini TTS request failed.';
      console.error('Gemini TTS error:', message);
      res.status(502).json({
        error: message,
        code: 'TTS_UPSTREAM_ERROR',
      });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CodeRecall server listening on http://0.0.0.0:${PORT}`);
  });
}

void startServer();
