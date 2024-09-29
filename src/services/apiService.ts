import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

export interface BeesCountData {
  sensor_id: string;
  count: number;
  timestamp: string;
}

export interface TemperatureHumidityData {
  sensor_id: string;
  temperature: number;
  humidity: number;
  timestamp: string;
}

export const analyzeDataWithLLM = async (
  beesData: BeesCountData[],
  sensorData: TemperatureHumidityData[]
): Promise<string> => {
    console.log('beesData:', beesData);
    console.log('sensorData:', sensorData);
  const prompt = `
    以下のデータに基づいて、ミツバチの活動と環境条件について分析してください：

    ハチのカウント：
    ${JSON.stringify(beesData, null, 2)}

    温度と湿度：
    ${JSON.stringify(sensorData, null, 2)}

    考慮すべきポイント：
    1. ハチの出入りの頻度と時間帯
    2. 温度と湿度の変化がハチの活動に与える影響
    3. 異常な活動や環境条件の検出
    4. 巣箱の健康状態の推測

    これらのデータから、現在の巣箱の状態を評価し、適切なアドバイスを下してください。
  `;

  try {
    console.log('Sending request to Gemini API...'); // デバッグ用
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Received response from Gemini API:', text); // デバッグ用
    return text;
  } catch (error) {
    console.error('LLM 分析に失敗しました:', error);
    throw error;
  }
};