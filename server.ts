import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, GenerateVideosOperation, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Body parser with 65MB limit for image and video data payloads
app.use(express.json({ limit: '65mb' }));
app.use(express.urlencoded({ extended: true, limit: '65mb' }));

// Lazy GoogleGenAI client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
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

// Clean user-friendly error formatting
function formatGeminiError(error: any, isVeo = false): string {
  const raw = error?.message || String(error);
  if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED') || raw.includes('quota')) {
    if (isVeo) {
      return 'Veo 3 video generation requires a Google AI Studio project with video generation quota enabled (or a paid billing plan). Your generated Master Prompt is ready to copy and use!';
    }
    return 'Gemini API quota exceeded for this model. Automatically falling back or please check your API key quota.';
  }
  if (raw.includes('503') || raw.includes('UNAVAILABLE') || raw.includes('high demand')) {
    return 'The AI model is currently experiencing temporary high demand. Please try again in a few moments.';
  }
  try {
    const jsonMatch = raw.match(/\{[\s\S]*"message"\s*:\s*"([^"]+)"[\s\S]*\}/);
    if (jsonMatch && jsonMatch[1]) {
      return jsonMatch[1];
    }
  } catch {}
  return raw;
}

// Resilient multi-tier model execution with automatic retries for transient 503/429 errors
async function executeGeminiWithFallback<T>(
  candidateModels: string[],
  requestFn: (model: string) => Promise<T>
): Promise<{ result: T; modelUsed: string }> {
  const errors: Array<{ model: string; error: string }> = [];

  for (let i = 0; i < candidateModels.length; i++) {
    const model = candidateModels[i];
    const maxRetries = 2;

    for (let retry = 0; retry <= maxRetries; retry++) {
      try {
        const result = await requestFn(model);
        return { result, modelUsed: model };
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        const status = err?.status || err?.code;
        const isQuotaLimitZero = errMsg.includes('limit: 0') || errMsg.includes('free_tier');
        const isUnavailable503 = status === 503 || errMsg.includes('503') || errMsg.includes('high demand');
        const isRateLimit429 = status === 429 || errMsg.includes('429');

        errors.push({ model, error: errMsg });
        console.warn(`[Gemini Pipeline] Model ${model} (attempt ${retry + 1}) encountered error:`, errMsg);

        // If quota limit is 0 (free tier has zero quota for pro), retrying the same model will never succeed.
        // Immediately break to the next fallback model.
        if (isQuotaLimitZero) {
          console.info(`[Gemini Pipeline] Quota is 0 for ${model}, switching immediately to next candidate.`);
          break;
        }

        // If it's a transient 503 or 429 with retry delay, wait briefly and retry
        if ((isUnavailable503 || isRateLimit429) && retry < maxRetries) {
          const delayMs = (retry + 1) * 1200;
          console.info(`[Gemini Pipeline] Transient error on ${model}. Retrying in ${delayMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        // Otherwise move to next candidate model
        break;
      }
    }
  }

  const lastErr = errors[errors.length - 1]?.error || 'All candidate AI models were unavailable.';
  throw new Error(formatGeminiError(lastErr));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Analyze Image or Video to Prompt
app.post('/api/analyze-media', async (req, res) => {
  try {
    const { mediaType, data, mimeType, promptStyle, language } = req.body;

    if (!data || !mimeType) {
      return res.status(400).json({
        success: false,
        error: 'Media data and MIME type are required.',
      });
    }

    const ai = getGeminiClient();

    // Prepare system instructions depending on whether media is image or video
    const isVideo = mediaType === 'video';
    const langInstruction = language === 'km' 
      ? 'Output the visual analysis and descriptions with bilingual clarity in both English (standard for AI generative models like Midjourney, Flux, Veo) and Khmer (ភាសាខ្មែរ).' 
      : 'Output in English optimized for generative AI prompt engineering.';

    const systemInstruction = `You are a world-class Multimodal AI Prompt Engineer and Cinematographer.
Your job is to reverse-engineer any ${isVideo ? 'video clip' : 'image'} into high-precision, production-grade text prompts for generative models such as Veo 3, Sora, Midjourney v6, Flux.1, and Stable Diffusion.

When analyzing the ${isVideo ? 'video' : 'image'}:
1. Reverse-engineer a complete "masterPrompt" that another AI model can use to recreate the visual essence, subject, atmosphere, and motion of this media with astounding fidelity.
2. Formulate a clean "negativePrompt" to avoid common visual artifacts.
3. Provide a structured breakdown:
   - "subjectDescription": Who/what is the main focus, appearance, wardrobe, posture, or core objects.
   - "actionAndMotion": ${isVideo ? 'Detailed sequence of movements, camera panning/tracking, pacing, speed, cuts, and kinetic energy.' : 'Dynamic tension, pose, implied motion, or static stillness.'}
   - "cameraAndLighting": Shot type (e.g. Extreme Close-up, Wide cinematic establishing, Over-the-shoulder, Drone shot), lens optics (e.g. 35mm anamorphic lens, shallow depth of field f/1.8, bokeh), lighting setup (e.g. golden hour volumetric rays, Rembrandt lighting, neon rim light, soft diffuse studio light), color grading palette.
   - "styleAndAesthetics": Visual genre (e.g. Cinematic 35mm film stock with subtle grain, Hyperrealistic 8K photograph, Cyberpunk surrealism, Anime/Painterly illustration).
   ${isVideo ? '- "timelineSegments": Breakdown of key chronological moments (timestamp, brief visual event, prompt keyword).' : ''}
4. ${langInstruction}
Ensure the masterPrompt is rich, descriptive, naturalistic, and free of vague fluff. It must be immediately copy-pasteable into image/video generators.`;

    const stylePromptMap: Record<string, string> = {
      veo_cinematic: 'Optimize the master prompt specifically for Veo 3 / Sora video generation: specify cinematic camera moves (e.g., slow dolly zoom, steady tracking shot), natural physics, photorealistic lighting, and atmospheric depth.',
      flux_midjourney: 'Optimize the master prompt for Midjourney v6 and Flux.1: emphasize hyper-detailed textures, photography camera gear, exact lighting setup, photorealistic skin pores or material shaders, aspect ratio tags, and art direction.',
      detailed_transcription: 'Provide a comprehensive visual transcription: capture every background detail, ambient environment, foreground subject, color accents, and motion cues.',
      creative_director: 'Provide an artistic director vision: capture the emotional mood, narrative storytelling, symbolic nuances, lighting temperature, and aesthetic styling.'
    };

    const targetStylePrompt = stylePromptMap[promptStyle] || stylePromptMap.veo_cinematic;
    const userPrompt = `Analyze this ${mediaType} in full depth. Reverse-engineer it into an exceptional text prompt. ${targetStylePrompt}`;

    const mediaPart = {
      inlineData: {
        data: data.replace(/^data:[^;]+;base64,/, ''),
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: userPrompt,
    };

    const schema = {
      type: Type.OBJECT,
      properties: {
        masterPrompt: {
          type: Type.STRING,
          description: 'The complete master prompt ready for generative AI video/image synthesis.',
        },
        negativePrompt: {
          type: Type.STRING,
          description: 'Suggested negative prompt terms to exclude artifacts.',
        },
        subjectDescription: {
          type: Type.STRING,
          description: 'Detailed description of the subject and character/objects.',
        },
        actionAndMotion: {
          type: Type.STRING,
          description: 'Kinetic movements, actions, camera motion, and dynamics.',
        },
        cameraAndLighting: {
          type: Type.STRING,
          description: 'Camera lens, framing, angles, lighting condition, and color temperature.',
        },
        styleAndAesthetics: {
          type: Type.STRING,
          description: 'Aesthetic genre, rendering style, film stock, or photographic texture.',
        },
        keyElements: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '5-8 key keyword tags for quick reference.',
        },
        timelineSegments: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING },
              description: { type: Type.STRING },
              promptTag: { type: Type.STRING },
            },
          },
          description: 'Chronological timeline transcription for video clips.',
        },
      },
      required: ['masterPrompt', 'subjectDescription', 'cameraAndLighting', 'styleAndAesthetics'],
    };

    // Primary model as mandated: gemini-3.1-pro-preview
    // With high-resilience fallback cascade: gemini-3.8-flash, gemini-flash-latest, gemini-3.1-flash-lite
    const candidateModels = [
      'gemini-3.1-pro-preview',
      'gemini-3.8-flash',
      'gemini-flash-latest',
      'gemini-3.1-flash-lite',
    ];

    const { result: response, modelUsed } = await executeGeminiWithFallback(
      candidateModels,
      async (model) => {
        return await ai.models.generateContent({
          model,
          contents: { parts: [mediaPart, textPart] },
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: schema,
          },
        });
      }
    );

    const rawResponseText = response.text || '';
    if (!rawResponseText) {
      throw new Error('No response returned from the AI model.');
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(rawResponseText);
    } catch (parseErr) {
      // Fallback in case raw text was not strict JSON
      parsedResult = {
        masterPrompt: rawResponseText,
        subjectDescription: 'Extracted from visual media',
        cameraAndLighting: 'Detailed in prompt',
        styleAndAesthetics: 'Cinematic visual aesthetics',
      };
    }

    parsedResult.modelUsed = modelUsed;

    return res.json({
      success: true,
      analysis: parsedResult,
      modelUsed,
    });
  } catch (error: any) {
    console.error('Error analyzing media:', error);
    return res.status(500).json({
      success: false,
      error: formatGeminiError(error),
    });
  }
});

// Veo 3 Video Generation: Start
app.post('/api/generate-video', async (req, res) => {
  try {
    const { prompt, aspectRatio = '16:9' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'A descriptive text prompt is required to generate video with Veo 3.',
      });
    }

    const ai = getGeminiClient();

    // Mandated model: veo-3.1-fast-generate-preview
    // with aspect ratio '16:9' (landscape) or '9:16' (portrait)
    const validAspectRatio = aspectRatio === '9:16' ? '9:16' : '16:9';
    let chosenModel = 'veo-3.1-fast-generate-preview';
    let operation;

    try {
      operation = await ai.models.generateVideos({
        model: chosenModel,
        prompt: prompt.trim(),
        config: {
          numberOfVideos: 1,
          aspectRatio: validAspectRatio,
          resolution: '720p',
        },
      });
    } catch (veoErr: any) {
      console.warn(`Veo fast model ${chosenModel} failed:`, veoErr?.message || veoErr);
      // Fallback to veo-3.1-lite-generate-preview if fast preview unavailable
      chosenModel = 'veo-3.1-lite-generate-preview';
      operation = await ai.models.generateVideos({
        model: chosenModel,
        prompt: prompt.trim(),
        config: {
          numberOfVideos: 1,
          aspectRatio: validAspectRatio,
          resolution: '720p',
        },
      });
    }

    return res.json({
      success: true,
      operationName: operation.name,
      modelUsed: chosenModel,
      aspectRatio: validAspectRatio,
    });
  } catch (error: any) {
    console.error('Error starting video generation:', error);
    return res.status(500).json({
      success: false,
      error: formatGeminiError(error, true),
    });
  }
});

// Veo 3 Video Generation: Poll status
app.post('/api/video-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ success: false, error: 'operationName is required' });
    }

    const ai = getGeminiClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });

    return res.json({
      done: Boolean(updated.done),
      error: updated.error ? String(updated.error.message || updated.error) : null,
      hasVideo: Boolean(updated.response?.generatedVideos?.[0]?.video?.uri),
    });
  } catch (error: any) {
    console.error('Error polling video operation:', error);
    return res.status(500).json({
      done: false,
      error: error?.message || 'Failed to poll video status',
    });
  }
});

// Veo 3 Video Generation: Download/Stream Video
app.post('/api/video-download', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }

    const ai = getGeminiClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });
    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

    if (!uri) {
      return res.status(404).json({ error: 'Video URI not found or video generation incomplete.' });
    }

    const videoRes = await fetch(uri, {
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!videoRes.ok) {
      throw new Error(`Failed to fetch video stream from Google storage: ${videoRes.statusText}`);
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'inline; filename="veo-generated-video.mp4"');

    // Stream the video back safely
    const arrayBuffer = await videoRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.end(buffer);
  } catch (error: any) {
    console.error('Error downloading video:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to download generated video.',
    });
  }
});

// Vite middleware & static serving
async function setupApp() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupApp();
