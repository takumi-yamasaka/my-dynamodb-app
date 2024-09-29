import AWS from 'aws-sdk';
import { BeeData } from '../utils/beeDataUtils';

export interface EnvironmentData {
  sensor_id: string;
  timestamp: string;
  temperature: number;
  humidity: number;
}

export const initializeAWS = () => {
  AWS.config.update({
    region: 'ap-northeast-1',
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY!,
  });
};

export const fetchBeesData = async (): Promise<BeeData[]> => {
  const dynamoDB = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: 'iot-beehive-monitor',
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    return data.Items as BeeData[] || [];
  } catch (err) {
    throw new Error('データ取得エラー: ' + (err as Error).message);
  }
};

export const fetchEnvironmentData = async (limit: number = 24): Promise<EnvironmentData[]> => {
  const dynamoDB = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: 'iot-beehive-monitor-temperature_humidity',
    Limit: limit,
    ScanIndexForward: false,
    KeyConditionExpression: 'sensor_id = :sensorId',
    ExpressionAttributeValues: {
      ':sensorId': 'sensor_1'
    }
  };

  try {
    const data = await dynamoDB.query(params).promise();
    if (data.Items && data.Items.length > 0) {
      return data.Items.map(item => {
        return {
          sensor_id: item.sensor_id,
          timestamp: item.timestamp,
          temperature: item.payload.temperature,
          humidity: item.payload.humidity
        };
      });
    }
    throw new Error('環境データが見つかりません');
  } catch (err) {
    console.error('環境データ取得エラー:', err);
    throw new Error('環境データ取得エラー: ' + (err as Error).message);
  }
};