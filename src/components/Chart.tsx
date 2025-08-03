import SingleLineChart from './SingleLineChart';
import MultiLineChart from './MultiLineChart';
import type { MultiDataPoint, SingleDataPoint } from '../App';

function isMultiSeries(data: (SingleDataPoint | MultiDataPoint)[]) {
  if (!data.length) return false;
  const firstValue = data[0][1];
  return Array.isArray(firstValue);
}

export default function Chart({
  title,
  data,
}: {
  title: string;
  data: (SingleDataPoint | MultiDataPoint)[];
}) {
  const multi = isMultiSeries(data);

  return (
    <div style={{ marginBottom: 40 }}>
      <h3>{title}</h3>
      {multi ? (
        <MultiLineChart data={data as MultiDataPoint[]} />
      ) : (
        <SingleLineChart data={data as SingleDataPoint[]} />
        // <p>single</p>
      )}
    </div>
  );
}
