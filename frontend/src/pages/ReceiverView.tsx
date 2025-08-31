import React, { useState } from 'react'
import CreateAidRequest from '../components/CreateAidRequest'

const ReceiverView = () => {
  const [activeTab, setActiveTab] = useState('needs')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleCreateRequest = () => {
    setShowCreateModal(true)
  }

  const handleSubmitRequest = (requestData: any) => {
    console.log('Aid request submitted with fx02 integration:', requestData)
    
    // Here you would typically send the data to your backend
    // The requestData includes fx02 fee calculation and AI validation
    alert(`Aid request created successfully!\n\nTarget: ₹${requestData.targetAmount}\nfx02 Fee: ₹${requestData.fx02Integration.protocolFee.toFixed(2)}\nTotal: ₹${requestData.fx02Integration.totalWithFees.toFixed(2)}`)
    
    setShowCreateModal(false)
    // Optionally refresh the requests list here
  }

  const handleUpdateProgress = (requestId: string) => {
    alert(`Update progress for request ${requestId} will be implemented here.`)
  }

  const handleViewDetails = (requestId: string) => {
    alert(`View details for request ${requestId} will be implemented here.`)
  }

  const handleUpdateDocuments = () => {
    alert('Update documents functionality will be implemented here.')
  }

  const handleUploadDocuments = () => {
    alert('Upload documents functionality will be implemented here.')
  }

  const myRequests = [
    {
      id: 1,
      title: "Medical Emergency Fund",
      description: "Urgent medical treatment required for family member",
      target: "₹50,000",
      raised: "₹32,000",
      progress: 64,
      status: "Active",
      daysLeft: 12,
      donors: 127
    },
    {
      id: 2,
      title: "Educational Support",
      description: "School fees and supplies for children's education",
      target: "₹25,000",
      raised: "₹25,000",
      progress: 100,
      status: "Completed",
      daysLeft: 0,
      donors: 89
    }
  ]

  const receivedAid = [
    {
      id: 1,
      type: "Direct Transfer",
      amount: "₹2,400",
      from: "Emergency Medical Fund",
      timestamp: "2 hours ago",
      txHash: "0x1234...5678",
      status: "Confirmed"
    },
    {
      id: 2,
      type: "Supply Distribution",
      amount: "₹800",
      from: "Food Security Program",
      timestamp: "1 day ago",
      txHash: "0x9876...5432",
      status: "Delivered"
    },
    {
      id: 3,
      type: "Direct Transfer",
      amount: "₹1,200",
      from: "Clean Water Initiative",
      timestamp: "3 days ago",
      txHash: "0xabcd...efgh",
      status: "Confirmed"
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Aid Receiver Portal</h1>
        <p className="text-lg text-gray-600">
          Track your aid requests and received support in real-time
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6 text-center">
          <div className="text-2xl font-bold text-primary-600 mb-2">₹57,000</div>
          <div className="text-sm text-gray-600">Total Received</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-2xl font-bold text-success-600 mb-2">216</div>
          <div className="text-sm text-gray-600">Total Donors</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-2xl font-bold text-warning-600 mb-2">1</div>
          <div className="text-sm text-gray-600">Active Requests</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-2xl font-bold text-secondary-600 mb-2">12</div>
          <div className="text-sm text-gray-600">Days Remaining</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'needs', name: 'My Requests', count: 2 },
            { id: 'received', name: 'Received Aid', count: 12 },
            { id: 'verification', name: 'Verification', count: null }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.name}
              {tab.count && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'needs' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">My Aid Requests</h2>
            <button 
              onClick={handleCreateRequest}
              className="btn-primary"
            >
              Create New Request
            </button>
          </div>

          {myRequests.map((request) => (
            <div key={request.id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                  <p className="text-gray-600 mt-1">{request.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  request.status === 'Active' ? 'bg-success-100 text-success-800' :
                  request.status === 'Completed' ? 'bg-primary-100 text-primary-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {request.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Target Amount</div>
                  <div className="font-semibold">{request.target}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Amount Raised</div>
                  <div className="font-semibold text-success-600">{request.raised}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Donors</div>
                  <div className="font-semibold">{request.donors}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Days Left</div>
                  <div className="font-semibold text-warning-600">
                    {request.daysLeft > 0 ? `${request.daysLeft} days` : 'Completed'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{request.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-success-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${request.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-end mt-4 space-x-3">
                <button 
                  onClick={() => handleViewDetails(request.id.toString())}
                  className="btn-secondary text-sm"
                >
                  View Details
                </button>
                <button 
                  onClick={() => handleUpdateProgress(request.id.toString())}
                  className="btn-primary text-sm"
                >
                  Update Progress
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'received' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Received Aid History</h2>
            <div className="flex space-x-2">
              <button className="btn-secondary text-sm">Export</button>
              <button className="btn-secondary text-sm">Filter</button>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {receivedAid.map((aid) => (
                    <tr key={aid.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {aid.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-success-600">
                        {aid.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {aid.from}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {aid.timestamp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          aid.status === 'Confirmed' ? 'bg-success-100 text-success-800' :
                          aid.status === 'Delivered' ? 'bg-primary-100 text-primary-800' :
                          'bg-warning-100 text-warning-800'
                        }`}>
                          {aid.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 font-mono">
                        <a href="#" className="hover:text-primary-800">
                          {aid.txHash}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'verification' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Identity & Need Verification</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identity Verification */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Identity Verification</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Government ID</span>
                  <span className="text-sm bg-success-100 text-success-800 px-2 py-1 rounded">
                    ✓ Verified
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Phone Number</span>
                  <span className="text-sm bg-success-100 text-success-800 px-2 py-1 rounded">
                    ✓ Verified
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Address Proof</span>
                  <span className="text-sm bg-warning-100 text-warning-800 px-2 py-1 rounded">
                    ⏳ Pending
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bank Account</span>
                  <span className="text-sm bg-success-100 text-success-800 px-2 py-1 rounded">
                    ✓ Verified
                  </span>
                </div>
              </div>
              <button 
                onClick={handleUpdateDocuments}
                className="btn-primary w-full mt-4"
              >
                Update Documents
              </button>
            </div>

            {/* Need Verification */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Need Verification</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Medical Records</span>
                  <span className="text-sm bg-success-100 text-success-800 px-2 py-1 rounded">
                    ✓ Verified
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Financial Documents</span>
                  <span className="text-sm bg-success-100 text-success-800 px-2 py-1 rounded">
                    ✓ Verified
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Supporting Documents</span>
                  <span className="text-sm bg-warning-100 text-warning-800 px-2 py-1 rounded">
                    ⏳ Review
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Third-party Verification</span>
                  <span className="text-sm bg-success-100 text-success-800 px-2 py-1 rounded">
                    ✓ Verified
                  </span>
                </div>
              </div>
              <button 
                onClick={handleUploadDocuments}
                className="btn-primary w-full mt-4"
              >
                Upload Documents
              </button>
            </div>
          </div>

          {/* Verification Timeline */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Verification Timeline</h3>
            <div className="space-y-4">
              {[
                { step: "Initial Registration", date: "Jan 15, 2025", status: "completed" },
                { step: "Document Submission", date: "Jan 16, 2025", status: "completed" },
                { step: "AI Verification", date: "Jan 17, 2025", status: "completed" },
                { step: "Manual Review", date: "Jan 18, 2025", status: "current" },
                { step: "Final Approval", date: "Pending", status: "pending" }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    item.status === 'completed' ? 'bg-success-500' :
                    item.status === 'current' ? 'bg-warning-500' :
                    'bg-gray-300'
                  }`}></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{item.step}</div>
                    <div className="text-xs text-gray-500">{item.date}</div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    item.status === 'completed' ? 'bg-success-100 text-success-800' :
                    item.status === 'current' ? 'bg-warning-100 text-warning-800' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {item.status === 'completed' ? 'Complete' :
                     item.status === 'current' ? 'In Progress' :
                     'Pending'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Aid Request Modal with fx02 Integration */}
      {showCreateModal && (
        <CreateAidRequest
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleSubmitRequest}
        />
      )}
    </div>
  )
}

export default ReceiverView
