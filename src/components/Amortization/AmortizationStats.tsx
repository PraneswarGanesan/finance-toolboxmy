import Decimal from "decimal.js"
import React, { useMemo } from "react"
import { Period } from "./AmortizationLayout"
import { NumericFormat } from "react-number-format"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Sector } from "recharts"

interface AmortizationStatsProps {
  periods: Period[]
}

const AmortizationStats: React.FC<AmortizationStatsProps> = React.memo(({ periods }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  
  const totalPrincipalPaid: Decimal = useMemo(
    () => periods.reduce<Decimal>((acc, current) => acc.plus(current.principalDue || 0), new Decimal(0)),
    [periods]
  )

  const totalInterestPaid: Decimal = useMemo(
    () => periods.reduce<Decimal>((acc, current) => acc.plus(current.interestDue || 0), new Decimal(0)),
    [periods]
  )

  const totalAmountPaid: Decimal = totalPrincipalPaid.plus(totalInterestPaid)

  const initialLoanAmount: Decimal = new Decimal(periods.length > 0 ? periods[0].remainingBalance.plus(totalAmountPaid) : 0)

  const remainingBalance: Decimal = useMemo(() => initialLoanAmount.minus(totalAmountPaid), [initialLoanAmount, totalAmountPaid])

  if (periods.length < 1) {
    return null
  }

  // Data for Donut Chart
  const data = [
    { name: "Principal Paid", value: totalPrincipalPaid.toNumber(), color: "#4D55CC" },
    { name: "Interest Paid", value: totalInterestPaid.toNumber(), color: "#7A73D1" },
    { name: "Remaining Balance", value: remainingBalance.toNumber(), color: "#B5A8D5" },
  ]
  
  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  // Calculate percentages
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  
  // Enhanced active sector rendering for professional look
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    
    return (
      <g>
        <text x={cx} y={cy - 15} dy={8} textAnchor="middle" fill="#333" className="text-lg font-semibold">
          {payload.name}
        </text>
        <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#333" fontWeight={500}>
          {formatCurrency(value)}
        </text>
        <text x={cx} y={cy + 40} dy={8} textAnchor="middle" fill="#666">
          {`${(percent * 100).toFixed(1)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 15}
          outerRadius={outerRadius + 20}
          fill={fill}
        />
      </g>
    );
  };
  
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div>
      {/* Responsive Layout for Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full min-w-0 mb-6">
        {/* Interest Paid */}
        <div className="flex flex-col items-center px-6 py-2 bg-white shadow rounded-lg">
          <NumericFormat
            className="text-2xl font-bold text-indigo-600"
            value={totalInterestPaid.toDP(2).toNumber()}
            displayType="text"
            prefix="$"
            thousandSeparator
          />
          <div className="text-sm font-medium">Interest Paid</div>
        </div>

        {/* Principal Paid */}
        <div className="flex flex-col items-center px-6 py-2 bg-white shadow rounded-lg">
          <NumericFormat
            className="text-2xl font-bold text-indigo-600"
            value={totalPrincipalPaid.toDP(2).toNumber()}
            displayType="text"
            prefix="$"
            thousandSeparator
          />
          <div className="text-sm font-medium">Principal Paid</div>
        </div>

        {/* Total Paid */}
        <div className="flex flex-col items-center px-6 py-2 bg-white shadow rounded-lg">
          <NumericFormat
            className="text-2xl font-bold text-indigo-600"
            value={totalAmountPaid.toDP(2).toNumber()}
            displayType="text"
            prefix="$"
            thousandSeparator
          />
          <div className="text-sm font-medium">Total Paid</div>
        </div>
      </div>

      {/* Donut Chart Section */}
      <div className="flex flex-col items-center justify-center mt-6 w-full">
        <h3 className="text-lg font-semibold text-center mb-2">Loan Payment Breakdown</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={onPieEnter}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any) => formatCurrency(value)}
              labelFormatter={(name) => `${name}`}
            />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center" 
              wrapperStyle={{ 
                fontSize: "14px", 
                fontWeight: "bold", 
                marginTop: "10px", 
                display: "flex", 
                flexWrap: "wrap", 
                justifyContent: "center" 
              }} 
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Summary text below chart */}
        <div className="text-center text-sm text-gray-600 mt-2">
          {`Total Loan Amount: ${formatCurrency(total)}`}
        </div>
      </div>
    </div>
  )
})

export default AmortizationStats