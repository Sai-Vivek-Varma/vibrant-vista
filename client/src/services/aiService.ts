import { toast } from "sonner";

// Configure Gemini AI (replace with your actual API key)
const GEMINI_API_KEY =
  import.meta.env.GEMINI_API_KEY || "AIzaSyB_iuzwaOPVeWkzwjQseKoWJSN-49vUyGU";

interface AiAnalysisResponse {
  insight: string;
  sentiment: "positive" | "neutral" | "negative";
  topics: string[];
  summary: string;
}

// Function to call Gemini AI
async function callGeminiAI(prompt: string): Promise<string> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

// Generate quick summary using Gemini AI
export const generateQuickSummary = async (
  content: string
): Promise<string> => {
  try {
    const prompt = `Please generate a concise 2-3 sentence summary of the following content for quick understanding. Focus on the key points and main ideas:\n\n${content.substring(
      0,
      2000
    )}`;
    return await callGeminiAI(prompt);
  } catch (error) {
    console.error("Error generating summary:", error);
    toast.error("Failed to generate summary");
    return "Could not generate summary at this time.";
  }
};

// Generate AI analysis
export const analyzeContent = async (
  content: string
): Promise<AiAnalysisResponse> => {
  try {
    const analysisPrompt = `Analyze the following content and provide:
    1. Key insight (1 sentence)
    2. Sentiment (positive, neutral, or negative)
    3. Main topics (2-3 keywords)
    4. Brief summary (2 sentences)
    
    Content: ${content.substring(0, 2000)}
    
    Return as JSON format with these keys: insight, sentiment, topics, summary`;

    const response = await callGeminiAI(analysisPrompt);
    const jsonStart = response.indexOf("{");
    const jsonEnd = response.lastIndexOf("}") + 1;
    const jsonString = response.slice(jsonStart, jsonEnd);
    const result = JSON.parse(jsonString) as AiAnalysisResponse;
    console.log(result);

    if (
      !result.insight ||
      !result.sentiment ||
      !result.topics ||
      !result.summary
    ) {
      throw new Error("Invalid analysis response structure");
    }
    return result;
  } catch (error) {
    console.error("Error analyzing content:", error);
    return {
      insight: "Analysis unavailable",
      sentiment: "neutral",
      topics: ["general"],
      summary: "Could not analyze content at this time",
    };
  }
};

// Generate audio using Web Speech API (browser-native)
export const generateAudio = (
  text: string,
  voice?: SpeechSynthesisVoice
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis not supported");
      return reject("Speech synthesis not supported");
    }

    const utterance = new SpeechSynthesisUtterance(text.substring(0, 300));

    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      reject(event);
    };

    window.speechSynthesis.speak(utterance);
  });
};
