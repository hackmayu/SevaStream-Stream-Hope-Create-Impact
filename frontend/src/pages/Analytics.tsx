import React from 'react'

const Analytics = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-lg text-gray-600">
          Real-time insights into donation flows and impact metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">$298K USDC</div>
          <div className="text-sm text-gray-600">Total Volume (24h)</div>
          <div className="text-xs text-success-600 mt-1">+15.3% vs yesterday</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-success-600 mb-2">3,247</div>
          <div className="text-sm text-gray-600">Active Streams</div>
          <div className="text-xs text-success-600 mt-1">+8.7% vs yesterday</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-secondary-600 mb-2">47s</div>
          <div className="text-sm text-gray-600">Avg Stream Duration</div>
          <div className="text-xs text-danger-600 mt-1">-12% vs yesterday</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-warning-600 mb-2">98.2%</div>
          <div className="text-sm text-gray-600">Success Rate</div>
          <div className="text-xs text-success-600 mt-1">+0.3% vs yesterday</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Real-time Stream Activity */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Live Stream Activity</h2>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {[
              { donor: "0x1234...5678", amount: "$0.38 USDC", cause: "Medical Emergency", time: "2s ago" },
              { donor: "0x9876...5432", amount: "$0.19 USDC", cause: "Clean Water", time: "5s ago" },
              { donor: "0xabcd...efgh", amount: "$0.77 USDC", cause: "Food Security", time: "8s ago" },
              { donor: "0x2468...1357", amount: "$0.58 USDC", cause: "Education", time: "12s ago" },
              { donor: "0x3691...4820", amount: "$0.19 USDC", cause: "Medical Emergency", time: "15s ago" },
              { donor: "0x7531...9642", amount: "$1.20 USDC", cause: "Disaster Relief", time: "18s ago" },
              { donor: "0x8642...7531", amount: "$0.38 USDC", cause: "Clean Water", time: "22s ago" }
            ].map((stream, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{stream.cause}</div>
                    <div className="text-xs text-gray-500">from {stream.donor}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-success-600">{stream.amount}</div>
                  <div className="text-xs text-gray-500">{stream.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Causes by Volume */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Top Causes (24h)</h2>
          <div className="space-y-4">
            {[
              { cause: "Medical Emergency", amount: "$101K USDC", percentage: 34, color: "bg-danger-500" },
              { cause: "Clean Water", amount: "$67K USDC", percentage: 23, color: "bg-primary-500" },
              { cause: "Food Security", amount: "$51K USDC", percentage: 17, color: "bg-success-500" },
              { cause: "Education", amount: "$46K USDC", percentage: 15, color: "bg-warning-500" },
              { cause: "Disaster Relief", amount: "$34K USDC", percentage: 11, color: "bg-secondary-500" }
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900">{item.cause}</span>
                  <span className="text-sm font-semibold">{item.amount}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-10">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Geographic Distribution */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Geographic Impact</h2>
          <div className="space-y-3">
            {[
              { region: "Maharashtra", amount: "$77K USDC", recipients: 1247 },
              { region: "Tamil Nadu", amount: "$67K USDC", recipients: 983 },
              { region: "West Bengal", amount: "$51K USDC", recipients: 756 },
              { region: "Karnataka", amount: "$46K USDC", recipients: 642 },
              { region: "Kerala", amount: "$34K USDC", recipients: 489 }
            ].map((region, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">{region.region}</div>
                  <div className="text-xs text-gray-500">{region.recipients} recipients</div>
                </div>
                <div className="text-sm font-semibold text-primary-600">{region.amount}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Network Stats */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Network Performance</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Network</span>
              <span className="text-sm font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded">
                Polygon
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Gas Fee</span>
              <span className="text-sm font-medium">$0.058 USDC</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Confirmation Time</span>
              <span className="text-sm font-medium">2.3s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="text-sm font-medium text-success-600">98.7%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Transactions</span>
              <span className="text-sm font-medium">127,492</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Network Load</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-warning-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <span className="text-xs text-gray-500">65%</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">AI Insights</h2>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900 mb-1">🔍 Pattern Detected</div>
              <div className="text-xs text-blue-700">
                Medical emergencies peak between 6-8 PM. Consider targeted campaigns.
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-green-900 mb-1">📈 Opportunity</div>
              <div className="text-xs text-green-700">
                Micro-donations (₹8-16) show 34% higher completion rates.
              </div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="text-sm font-medium text-yellow-900 mb-1">⚠️ Alert</div>
              <div className="text-xs text-yellow-700">
                Food security funding 23% below historical average this week.
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-sm font-medium text-purple-900 mb-1">🎯 Recommendation</div>
              <div className="text-xs text-purple-700">
                Weekend campaigns generate 45% more engagement.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <div className="flex space-x-2">
            <button className="btn-secondary text-sm">Export</button>
            <button className="btn-secondary text-sm">Filter</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction Hash
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cause
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { hash: "0x1234...5678", from: "0xabcd...1234", to: "0x5678...efgh", amount: "₹16", cause: "Medical", time: "2 min ago" },
                { hash: "0x9876...5432", from: "0xijkl...5678", to: "0x1234...mnop", amount: "₹8", cause: "Water", time: "3 min ago" },
                { hash: "0xabcd...efgh", from: "0xqrst...9012", to: "0x3456...uvwx", amount: "₹32", cause: "Food", time: "4 min ago" },
                { hash: "0x2468...1357", from: "0xyzab...3456", to: "0x7890...cdef", amount: "₹24", cause: "Education", time: "5 min ago" },
                { hash: "0x3691...4820", from: "0xghij...7890", to: "0xklmn...opqr", amount: "₹8", cause: "Medical", time: "6 min ago" }
              ].map((tx, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-primary-600">
                    <a href="#" className="hover:text-primary-800">{tx.hash}</a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {tx.from}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {tx.to}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-success-600">
                    {tx.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tx.cause}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tx.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Analytics
