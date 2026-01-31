interface RiskDistributionData {
  high: { count: number; percentage: number };
  medium: { count: number; percentage: number };
  low: { count: number; percentage: number };
  total: number;
}

interface RiskDistributionChartProps {
  data: RiskDistributionData;
}

export function RiskDistributionChart({ data }: RiskDistributionChartProps) {
  return (
    <div className="bg-white rounded-xl p-6 card-shadow">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Distribusi Risiko</h3>
      <div className="space-y-4">
        {/* High Risk */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-medium text-gray-700">Tinggi</span>
            <span className="text-lg font-bold text-gray-900">
              {data.high.count} ({data.high.percentage}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-red-500 h-3 rounded-full chart-bar"
              style={{ width: `${data.high.percentage}%` }}
            />
          </div>
        </div>

        {/* Medium Risk */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-medium text-gray-700">Sedang</span>
            <span className="text-lg font-bold text-gray-900">
              {data.medium.count} ({data.medium.percentage}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-yellow-500 h-3 rounded-full chart-bar"
              style={{ width: `${data.medium.percentage}%` }}
            />
          </div>
        </div>

        {/* Low Risk */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-medium text-gray-700">Rendah</span>
            <span className="text-lg font-bold text-gray-900">
              {data.low.count} ({data.low.percentage}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full chart-bar"
              style={{ width: `${data.low.percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-lg">
          <span className="text-gray-600">Total Pasien</span>
          <span className="text-2xl font-bold text-gray-900">{data.total}</span>
        </div>
      </div>
    </div>
  );
}
