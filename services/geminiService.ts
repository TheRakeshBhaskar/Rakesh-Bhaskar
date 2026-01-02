
import { GoogleGenAI, Modality } from "@google/genai";
import { decode, decodeAudioData } from "../utils/audioUtils";

const API_KEY = process.env.API_KEY || '';

export const MARATHI_VOICES = [
  { id: 'Kore', name: 'कोरे (गंभीर)', description: 'बातमीसाठी योग्य' },
  { id: 'Puck', name: 'पक (उत्साही)', description: 'हलक्या बातम्यांसाठी' },
  { id: 'Charon', name: 'कॅरॉन (शांत)', description: 'माहितीपर बातम्यांसाठी' },
  { id: 'Fenrir', name: 'फेन्रिर (खोल)', description: 'महत्वाच्या घोषणांसाठी' },
  { id: 'Zephyr', name: 'झेफिर (मैत्रीपूर्ण)', description: 'दैनंदिन अपडेट्ससाठी' }
];

export interface SpeechResult {
  buffer: AudioBuffer;
  rawPcm: Uint8Array;
}

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  async generateNewsScript(rawText: string): Promise<string> {
    const prompt = `
तुम्ही एक अनुभवी न्यूज अँकर आहात. खाली दिलेल्या मजकुरावरून मराठीत स्पष्ट आणि समजणारी बातमी तयार करा.

सुरुवात साध्या आणि आपुलकीच्या intro ने करा:
“नमस्कार मंडळी. आपण ऐकत आहात Waartaa.in. चला, आजची महत्वाची बातमी ऐकूया.”

बातमी सोप्या शब्दांत समजावून सांगा.
अवघड शब्द टाळा.
तथ्यांवर बोला.
कोणताही पक्षपात किंवा वैयक्तिक मत देऊ नका.

जर बातमीत गावकऱ्यांसाठी उपयोगी माहिती असेल
तर ती शेवटी थोडक्यात समजवा.

शेवट साध्या outro ने करा:
“ही होती आजची बातमी. अजून माहिती आणि अपडेट्ससाठी Waartaa.in ऐकत रहा. पुन्हा भेटू.”

आवाज शांत, विश्वासार्ह आणि नैसर्गिक ठेवा.
कालावधी शक्य असेल तर 45 ते 75 सेकंदांच्या आत ठेवा.

बातमीचा मजकूर:
${rawText}
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    return response.text || "क्षमस्व, बातमी तयार करण्यात अडथळा आला.";
  }

  async generateSpeech(text: string, voice: string = 'Kore'): Promise<SpeechResult> {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data received from Gemini API.");
    }

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioData = decode(base64Audio);
    const buffer = await decodeAudioData(audioData, audioCtx, 24000, 1);
    
    return { buffer, rawPcm: audioData };
  }
}

export const geminiService = new GeminiService();
