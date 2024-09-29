import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

export interface BeesCountData {
  timestamp: string;
  bee_type: string;
}

export interface TemperatureHumidityData {
  sensor_id: string;
  temperature: number;
  humidity: number;
  timestamp: string;
}

export const transformSensorData = (data: any): TemperatureHumidityData => {
  console.log('data:', JSON.stringify(data));
  return {
    sensor_id: data.sensor_id.S || '',
    temperature: parseFloat(data.temperature || '0'),
    humidity: parseFloat(data.humidity || '0'),
    timestamp: data.timestamp || '',
  };
};

export const analyzeDataWithLLM = async (
  beesData: BeesCountData[],
  sensorData: any[]
): Promise<string> => {
  const transformedSensorData = sensorData.map(transformSensorData);
  console.log('transformedSensorData:', JSON.stringify(transformedSensorData));
  console.log('beesData:', JSON.stringify(beesData));
  console.log('sensorData:', JSON.stringify(transformedSensorData));

  const prompt = `
     以下のデータに基づいて、ミツバチの活動と環境条件について分析してください：

     ハチのカウント：
     ${JSON.stringify(beesData)}

     温度と湿度：
     ${JSON.stringify(transformedSensorData)}

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
    return text;
  } catch (error) {
    console.error('LLM 分析に失敗しました:', error);
    throw error;
  }
};