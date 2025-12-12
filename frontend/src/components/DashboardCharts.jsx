import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'

const difficultyColors = ['#10b981', '#f59e0b', '#ef4444']

const formatPercentage = (value) => `${value}%`

export const DashboardCharts = ({ difficulty = [], steps = [] }) => {
  const difficultyData = difficulty.map((item) => ({
    name: item.difficulty,
    value: item.completed,
    total: item.total
  }))

  const stepData = steps.map((step) => ({
    name: `S${step.step_index + 1}`,
    completion: Number(step.completionPercentage || 0)
  }))

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card">
        <h3 className="text-sm font-medium text-slate-500">Solved by difficulty</h3>
        <div className="mt-6 h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={difficultyData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
              >
                {difficultyData.map((entry, index) => (
                  <Cell key={entry.name} fill={difficultyColors[index % difficultyColors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val, name, props) => [`${val} solved`, `${name} (${props.payload.total} total)`]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-surface-border bg-surface p-6 shadow-card">
        <h3 className="text-sm font-medium text-slate-500">Step completion %</h3>
        <div className="mt-6 h-64">
          <ResponsiveContainer>
            <BarChart data={stepData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={formatPercentage} />
              <Tooltip formatter={(value) => [`${value}%`, 'Completion']} />
              <Bar dataKey="completion" radius={[8, 8, 0, 0]} fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
