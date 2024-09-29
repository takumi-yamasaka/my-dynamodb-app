export interface BeeData {
  timestamp: string;
  bee_type: 'bee_in' | 'bee_out';
}

export const groupByDate = (data: BeeData[]) => {
  const groupedData: { [date: string]: BeeData[] } = {};

  data.forEach((item) => {
    const date = new Date(item.timestamp).toLocaleDateString();
    if (!groupedData[date]) {
      groupedData[date] = [];
    }
    groupedData[date].push(item);
  });

  return groupedData;
};

export const sortDates = (dates: string[]) => {
  return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
};