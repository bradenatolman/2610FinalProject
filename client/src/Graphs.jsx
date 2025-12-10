import { Label, Pie, PieChart, Sector, Tooltip } from 'recharts';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { LineChart, Line } from 'recharts';
import React from 'react';

// #endregion
const RADIAN = Math.PI / 180;
const renderActiveShape = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  fill,
  payload,
  percent,
  value,
}) => {
  const sin = Math.sin(-RADIAN * (midAngle ?? 1));
  const cos = Math.cos(-RADIAN * (midAngle ?? 1));
  const sx = (cx ?? 0) + ((outerRadius ?? 0) + 10) * cos;
  const sy = (cy ?? 0) + ((outerRadius ?? 0) + 10) * sin;
  const mx = (cx ?? 0) + ((outerRadius ?? 0) + 30) * cos;
  const my = (cy ?? 0) + ((outerRadius ?? 0) + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={(outerRadius ?? 0) + 6}
        outerRadius={(outerRadius ?? 0) + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#ffffffff">{`\$${value}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="rgba(255, 255, 255, 1)">
        {`(${((percent ?? 1) * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

export function Donut(props) {
    const {name, data, defaultIndex=undefined } = props;

const [activeIndex, setActiveIndex] = React.useState(defaultIndex);

return (
    <PieChart
        style={{ width: '100%', maxWidth: '500px', maxHeight: '80vh', aspectRatio: 1 }}
        responsive
        margin={{
            top: 50,
            right: 120,
            bottom: 0,
            left: 120,
        }}
    >
        <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            dataKey="value"
            isAnimationActive={false}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(undefined)}
        />
        <Tooltip content={() => null} defaultIndex={defaultIndex} />
        {activeIndex === undefined && (
            <Label value={name} position="center" offset={20} />
        )}
    </PieChart>
);
}

/************************************************************************** */


export function SimpleBarChart(props) {
    const {data} = props;
  return (
    <BarChart
      style={{ width: '100%', maxWidth: '700px', maxHeight: '70vh', aspectRatio: 1.618 }}
      responsive
      data={data}
      margin={{
        top: 5,
        right: 0,
        left: 0,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis width="auto" />
      <Tooltip />
      <Legend />
      <Bar dataKey="Expected" fill="#00b900ff" activeBar={<Rectangle fill="pink" stroke="blue" />} />
      <Bar dataKey="Actual" fill="#c50000ff" activeBar={<Rectangle fill="gold" stroke="purple" />} />
    </BarChart>
  );
};


/************************************************************************** */

export function LineGraph(props) {
    const {data} = props;
  return (
    <LineChart
      style={{ width: '100%', maxWidth: '700px', height: '100%', maxHeight: '70vh', aspectRatio: 1.618 }}
      responsive
      data={data}
      margin={{
        top: 5,
        right: 0,
        left: 0,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis width="auto" />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="Expected" stroke="#8884d8" activeDot={{ r: 8 }} />
      <Line type="monotone" dataKey="Actual" stroke="#d43800ff" />
      <Line type="monotone" dataKey="Income" stroke="#07d400ff" />
    </LineChart>
  );
}
