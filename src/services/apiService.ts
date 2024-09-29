import axios from 'axios';
import { HfInference } from '@huggingface/inference';

const API_ENDPOINT = 'https://nwi2q1b919.execute-api.ap-northeast-1.amazonaws.com/default/iot_example';
const HF_ACCESS_TOKEN = process.env.REACT_APP_HF_ACCESS_TOKEN;

console.log('HF_ACCESS_TOKEN:', HF_ACCESS_TOKEN); // デバッグ用

const hf = new HfInference(HF_ACCESS_TOKEN);

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

export interface ApiResponse {
  bees_count_data: BeesCountData[];
  temperature_humidity_data: TemperatureHumidityData[];
}

export const fetchApiData = async (): Promise<ApiResponse> => {
  try {
    const response = await axios.get(API_ENDPOINT);
    
    if (response.data && response.data.body) {
      return JSON.parse(response.data.body);
    } else if (response.data) {
      return response.data;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('API データの取得に失敗しました:', error);
    throw error;
  }
};

export const analyzeDataWithLLM = async (data: ApiResponse): Promise<string> => {
  const prompt = `
    以下のデータに基づいて、ミツバチの活動と環境条件について分析してください：

    ハチのカウント：
    ${JSON.stringify(data.bees_count_data, null, 2)}

    温度と湿度：
    ${JSON.stringify(data.temperature_humidity_data, null, 2)}

    考慮すべきポイント：
    1. ハチの出入りの頻度と時間帯
    2. 温度と湿度の変化がハチの活動に与える影響
    3. 異常な活動や環境条件の検出
    4. 巣箱の健康状態の推測

    これらのデータから、巣箱の状態と管理に関する重要なポイントを3つ挙げてください。
  `;

  try {
    console.log('Sending request to Hugging Face API...'); // デバッグ用
    const response = await hf.textGeneration({
      model: 'gpt2-large',  // または他の適切なモデル
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.7,
      },
    });
    console.log('Received response from Hugging Face API:', response); // デバッグ用
    return response.generated_text;
  } catch (error) {
    console.error('LLM 分析に失敗しました:', error);
    throw error;
  }
};