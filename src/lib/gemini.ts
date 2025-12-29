/**
 * Gemini AI Integration
 * Uses the free Gemini API (gemini-pro model) for AI-powered features
 */

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export interface GeminiRequest {
  prompt: string;
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GeminiResponse {
  success: boolean;
  text?: string;
  error?: string;
}

/**
 * Generate content using Gemini Pro model
 */
export async function generateWithGemini({
  prompt,
  apiKey,
  temperature = 0.7,
}: GeminiRequest): Promise<GeminiResponse> {
  if (!apiKey) {
    return {
      success: false,
      error: 'API key is required. Please add your Gemini API key in Settings.',
    };
  }

  try {
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error?.message || `API Error: ${response.status}`,
      };
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return {
        success: false,
        error: 'No content generated',
      };
    }

    return {
      success: true,
      text: generatedText,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Generate product descriptions
 */
export async function generateProductDescription(
  productName: string,
  features: string[],
  apiKey: string
): Promise<GeminiResponse> {
  const prompt = `Create a compelling product description for "${productName}". 
The product has the following features: ${features.join(', ')}.
Write a professional, engaging description that would appeal to customers looking for luxury hair products.
Keep it between 100-150 words.`;

  return generateWithGemini({ prompt, apiKey, temperature: 0.8 });
}

/**
 * Generate marketing content
 */
export async function generateMarketingContent(
  topic: string,
  tone: string,
  apiKey: string
): Promise<GeminiResponse> {
  const prompt = `Create marketing content about "${topic}" with a ${tone} tone.
The content is for a luxury hair extensions and beauty products brand called Luna Luxury Hair.
Write engaging content suitable for social media or email marketing.
Keep it concise and impactful, around 100 words.`;

  return generateWithGemini({ prompt, apiKey, temperature: 0.9 });
}

/**
 * Generate SEO content
 */
export async function generateSEOContent(
  keyword: string,
  contentType: string,
  apiKey: string
): Promise<GeminiResponse> {
  const prompt = `Create SEO-optimized ${contentType} content focused on the keyword "${keyword}".
The content is for a luxury hair extensions brand.
Include relevant keywords naturally while maintaining readability.
Keep it engaging and informative.`;

  return generateWithGemini({ prompt, apiKey, temperature: 0.7 });
}

/**
 * Analyze and suggest improvements for existing content
 */
export async function analyzeContent(
  content: string,
  apiKey: string
): Promise<GeminiResponse> {
  const prompt = `Analyze this content and suggest improvements:

"${content}"

Provide specific suggestions for:
1. Clarity and readability
2. Engagement and appeal
3. SEO optimization
4. Call-to-action effectiveness

Keep suggestions concise and actionable.`;

  return generateWithGemini({ prompt, apiKey, temperature: 0.6 });
}

/**
 * Generate color palette suggestions based on description
 */
export async function generateColorPalette(
  description: string,
  apiKey: string
): Promise<GeminiResponse> {
  const prompt = `Based on this description: "${description}", 
suggest a color palette (5 colors) for a luxury hair brand website.
Return the response in this exact format:
Primary: #HEXCODE - Description
Secondary: #HEXCODE - Description
Accent: #HEXCODE - Description
Background: #HEXCODE - Description
Text: #HEXCODE - Description

Make sure the colors are elegant, professional, and work well together.`;

  return generateWithGemini({ prompt, apiKey, temperature: 0.8 });
}
