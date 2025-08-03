import Chart from './components/Chart';
import data from './data.json';

export type SingleDataPoint = [number, number | null];
export type MultiDataPoint = [number, (number | null)[]];

export type ChartData = {
  title: string;
  data: (SingleDataPoint | MultiDataPoint)[];
};

function App() {
  return (
    <div className="p-12 container mx-auto">
      {(data as ChartData[]).map((chart, index) => (
        <Chart key={index} title={chart.title} data={chart.data} />
      ))}
    </div>
  );
}

export default App;
