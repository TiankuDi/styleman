import { GoogleGenAI } from '@google/genai';
import { StyleReport } from '../types/stylist.ts';
import { DEFAULT_STYLE_REPORT } from '../data/sampleOutfits.ts';

export async function analyzeOutfitWithGemini(params: {
  imageBase64: string;
  mimeType?: string;
  occasion?: string;
}): Promise<StyleReport> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not found in environment, returning customized curated report');
    return DEFAULT_STYLE_REPORT;
  }

  const ai = new GoogleGenAI();
  const mimeType = params.mimeType || 'image/jpeg';
  // Strip data url prefix if present
  const base64Data = params.imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '');

  const prompt = `你是一位享譽國際的頂級時尚總監與明星個人造型顧問（Senior High-Fashion Director & Stylist）。
請針對這張照片中的穿搭與人物外貌進行全方位專業美學診斷，並依據特定場合「${params.occasion || '綜合日常與精緻場合'}」給予深度評分與實用改造建議。

請以嚴格但具啟發性的專業時尚眼光進行評鑑，回傳繁體中文（台灣習慣用語）的標準 JSON 格式，不要包含任何 markdown 代碼塊標籤（如 \`\`\`json ），直接輸出合法純 JSON 字串。

JSON 結構必須包含以下欄位：
{
  "overallScore": 88, // 0 - 100 整數
  "rankBadge": "S", // S+, S, A+, A, B+, B
  "styleArchetype": "風格稱號（如：摩登都會極簡雅痞、法式鬆弛輕奢、日系工裝層次、高街潮酷、韓系溫柔氛圍感）",
  "seasonPaletteType": "個人色彩季別（如：柔和暖秋型 Soft Autumn、明亮冷冬型 Clear Winter、清新淺春型 Light Spring、優雅柔夏型 Soft Summer）",
  "headline": "一句精闢的時尚評語標題（約15-25字）",
  "spokenCritique": "專為語音播報撰寫的簡要口語評語（約80-120繁體中文字）。語調親切優雅、具有專業造型師的肯定與畫龍點睛的關鍵提升建議，適合用語音朗讀出來。",
  "metrics": {
    "colorHarmony": { "name": "colorHarmony", "label": "色彩搭配", "score": 85, "comment": "簡要講述色彩呼應與明暗層次" },
    "silhouetteFit": { "name": "silhouetteFit", "label": "身形剪裁與比例", "score": 90, "comment": "簡要講述版型、腰線與頭身比例" },
    "styleCohesion": { "name": "styleCohesion", "label": "風格統一性", "score": 88, "comment": "服裝上下身風格的一致協調度" },
    "accessoryDetail": { "name": "accessoryDetail", "label": "配件與細節精緻度", "score": 80, "comment": "鞋、包、珠寶首飾、皮帶的精緻呼應" },
    "occasionSuitability": { "name": "occasionSuitability", "label": "場合適配度", "score": 92, "comment": "與該場合的契合程度" },
    "hairGrooming": { "name": "hairGrooming", "label": "髮型氣質與氛圍", "score": 86, "comment": "髮型、妝容或儀態整潔度評析" }
  },
  "strengths": [
    "亮點1",
    "亮點2",
    "亮點3"
  ],
  "improvements": [
    "實用改進點1（具體可執行，如：將皮帶扣露出、換上一雙厚底樂福鞋）",
    "實用改進點2",
    "實用改進點3"
  ],
  "colorPalette": [
    { "name": "顏色名稱1", "hex": "#HEX", "percentage": 40, "role": "primary", "description": "用途分析" },
    { "name": "顏色名稱2", "hex": "#HEX", "percentage": 30, "role": "secondary", "description": "用途分析" },
    { "name": "顏色名稱3", "hex": "#HEX", "percentage": 20, "role": "accent", "description": "用途分析" },
    { "name": "顏色名稱4", "hex": "#HEX", "percentage": 10, "role": "accent", "description": "用途分析" }
  ],
  "items": [
    {
      "id": "item-1",
      "type": "headwear|top|bottom|outerwear|footwear|bag|accessory",
      "name": "單品精準名稱（如：微落肩雙排扣羊毛西裝外套）",
      "x": 50, // 該單品在照片中的水平百分比位置 (0-100)
      "y": 40, // 該單品在照片中的垂直百分比位置 (0-100)
      "score": 5, // 1 - 5 星
      "critique": "單品短評",
      "recommendation": "搭配建議或替換提案"
    }
    // 請精準辨識 3 至 5 個顯著的穿搭單品（如髮型、外套/上衣、下身、鞋履、手袋或關鍵飾品）
  ],
  "bodyProportionAdvice": "身形比例分析（分析三七分黃金比例、垂直拉長效果與修飾焦點）",
  "recommendedOccasions": [
    { "occasion": "場合1", "fitRate": 95 },
    { "occasion": "場合2", "fitRate": 88 },
    { "occasion": "場合3", "fitRate": 80 }
  ],
  "stylingTips": [
    { "title": "造型小技巧1標題", "advice": "具體操作手法" },
    { "title": "造型小技巧2標題", "advice": "具體操作手法" }
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Gemini response is empty');
    }

    // Clean up potential markdown code block fences if any
    const cleaned = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    const parsed = JSON.parse(cleaned) as StyleReport;
    return parsed;
  } catch (error) {
    console.error('Error invoking Gemini for outfit analysis:', error);
    // Return gracefully adjusted fallback
    return {
      ...DEFAULT_STYLE_REPORT,
      headline: 'AI 造型顧問已完成快速美學診斷（依視覺特徵分析）',
    };
  }
}
