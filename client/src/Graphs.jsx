// import { Pie, PieChart, Sector, Tooltip } from 'recharts';
// import { useState, useEffect } from 'react';


// // #region Sample data
// const [data, setData] = useState([
//     {name: 'Group A', value: 400, fill: '#0088FE' },
//   { name: 'Group B', value: 300, fill: '#00C49F' },
//   { name: 'Group C', value: 300, fill: '#FFBB28' },
//   { name: 'Group D', value: 200, fill: '#FF8042' },]);

// // #endregion
// const RADIAN = Math.PI / 180;
// const renderActiveShape = ({
//   cx,
//   cy,
//   midAngle,
//   innerRadius,
//   outerRadius,
//   startAngle,
//   endAngle,
//   fill,
//   payload,
//   percent,
//   value,
// }) => {
//   const cos = Math.cos(-RADIAN * (midAngle ?? 1));
//   const sx = (cx ?? 0) + ((outerRadius ?? 0) + 10) * cos;
//   const sy = (cy ?? 0) + ((outerRadius ?? 0) + 10) * sin;
//   const mx = (cx ?? 0) + ((outerRadius ?? 0) + 30) * cos;
//   const my = (cy ?? 0) + ((outerRadius ?? 0) + 30) * sin;
//   const ex = mx + (cos >= 0 ? 1 : -1) * 22;
//   const ey = my;
//   const textAnchor = cos >= 0 ? 'start' : 'end';

//   return (
//     <g>
//       <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
//         {payload.name}
//       </text>
//       <Sector
//         cx={cx}
//         cy={cy}
//         innerRadius={innerRadius}
//         outerRadius={outerRadius}
//         startAngle={startAngle}
//         endAngle={endAngle}
//         fill={fill}
//       />
//       <Sector
//         cx={cx}
//         cy={cy}
//         startAngle={startAngle}
//         endAngle={endAngle}
//         innerRadius={(outerRadius ?? 0) + 6}
//         outerRadius={(outerRadius ?? 0) + 10}
//         fill={fill}
//       />
//       <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
//       <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
//       <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`\$${value}`}</text>
//       <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#899">
//         {`(${((percent ?? 1) * 100).toFixed(2)}%)`}
//       </text>
//     </g>
//   );
// };

// export default function Donut(props) {
//     const { changed, data, defaultIndex=undefined } = props;

//     useEffect(() => {
//         setData(data);
//     }, [changed]);

//   return (
//     <PieChart
//       style={{ width: '100%', maxWidth: '500px', maxHeight: '80vh', aspectRatio: 1 }}
//       responsive
//       margin={{
//         top: 50,
//         right: 120,
//         bottom: 0,
//         left: 120,
//       }}
//     >
//       <Pie
//         activeShape={renderActiveShape}
//         data={data}
//         cx="50%"
//         cy="50%"
//         innerRadius="60%"
//         outerRadius="80%"
//         dataKey="value"
//         isAnimationActive={true}
//       />
//       <Tooltip content={() => null} defaultIndex={defaultIndex} />
//     </PieChart>
//   );
// }