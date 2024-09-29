import React, { useEffect, useState } from 'react';
import AWS from 'aws-sdk';
import { Container, Typography, Card, CardContent, Grid, CircularProgress, Alert, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import beeInImage from './images/bee_in.png';
import beeOutImage from './images/bee_out.png';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { ChartData } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const App: React.FC = () => {
    const [beesData, setBeesData] = useState<any[]>([]);
    const [sensorData, setSensorData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    
    useEffect(() => {
        AWS.config.update({
            region: 'ap-northeast-1',
            accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY!,
        });

        const dynamoDB = new AWS.DynamoDB.DocumentClient();
        
        const fetchData = async () => {
            const beesParams = {
                TableName: 'iot-beehive-monitor',
            };
            const sensorParams = {
                TableName: 'iot-beehive-monitor-temperature_humidity',
            };

            try {
                const beesResult = await dynamoDB.scan(beesParams).promise();
                const sensorResult = await dynamoDB.scan(sensorParams).promise();
                console.log('Bees Data:', beesResult.Items);
                console.log('Sensor Data:', sensorResult.Items);
                setBeesData(beesResult.Items || []);
                setSensorData(sensorResult.Items || []);
            } catch (err) {
                setError('データ取得エラー: ' + (err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const groupBeeDataByDate = (data: any[]) => {
        const grouped = data.reduce((acc, curr) => {
            const date = new Date(curr.timestamp).toLocaleDateString();
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(curr);
            return acc;
        }, {});

        return Object.entries(grouped).sort(([dateA], [dateB]) => 
            new Date(dateB).getTime() - new Date(dateA).getTime()
        );
    };

    const prepareChartData = () => {
        if (sensorData.length === 0) return null;
        
        console.log('Preparing chart data with:', sensorData);
        
        const sortedData = sensorData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        return {
            labels: sortedData.map(item => new Date(item.timestamp).toLocaleString()),
            datasets: [
                {
                    label: '温度 (°C)',
                    data: sortedData.map(item => parseFloat(item.payload.temperature)),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                },
                {
                    label: '湿度 (%)',
                    data: sortedData.map(item => parseFloat(item.payload.humidity)),
                    borderColor: 'rgb(53, 162, 235)',
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                },
            ],
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: '温度と湿度の推移',
            },
        },
    };

    return (
        <Container>
            <Typography variant="h4" align="center" gutterBottom>
                ハチの巣箱モニタリング
            </Typography>
            {loading && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}
            
            {groupBeeDataByDate(beesData).map(([date, bees]) => (
                <Accordion key={date}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography>{date} - ハチの出入り: {Array.isArray(bees) ? bees.length : 0}回</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            {(bees as any[]).map((bee: any, index: number) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Card>
                                        <CardContent>
                                            <img 
                                                src={bee.bee_type === "bee_in" ? beeInImage : beeOutImage} 
                                                alt={bee.bee_type === "bee_in" ? "ハチ入巣" : "ハチ出巣"} 
                                                style={{ width: '40px', height: '40px' }}
                                            />
                                            <Typography variant="h6">
                                                ハチの動き: {bee.bee_type === "bee_in" ? "入巣" : "出巣"}
                                            </Typography>
                                            <Typography color="textSecondary">
                                                {new Date(bee.timestamp).toLocaleTimeString()}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            ))}

            <Card style={{ marginTop: '20px' }}>
                <CardContent>
                    {sensorData.length > 0 ? (
                        <Line options={chartOptions} data={prepareChartData() as ChartData<"line", number[], string>} />
                    ) : (
                        <Typography>センサーデータがありません</Typography>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};

export default App;
