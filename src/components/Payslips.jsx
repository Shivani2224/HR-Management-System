import { useState, useEffect } from 'react'

function Payslips({ username, userRole }) {
  const [payslips, setPayslips] = useState([])
  const [selectedPayslip, setSelectedPayslip] = useState(null)

  useEffect(() => {
    generateDemoPayslips()
  }, [username])

  const generateDemoPayslips = () => {
    // Generate demo payslips for the last 6 months
    const demoPayslips = []
    const currentDate = new Date()

    // Base salary based on role
    const baseSalaries = {
      employee: 50000,
      manager: 75000,
      admin: 100000
    }

    const baseSalary = baseSalaries[userRole] || 50000

    for (let i = 0; i < 6; i++) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthStr = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

      // Calculate components with slight variations
      const basic = baseSalary
      const hra = Math.round(basic * 0.4)
      const transport = 2000
      const medical = 1500
      const bonus = i === 0 ? Math.round(basic * 0.1) : 0 // Bonus in current month

      const grossSalary = basic + hra + transport + medical + bonus

      const tax = Math.round(grossSalary * 0.1)
      const providentFund = Math.round(basic * 0.12)
      const insurance = 500

      const totalDeductions = tax + providentFund + insurance
      const netSalary = grossSalary - totalDeductions

      demoPayslips.push({
        id: `pay-${i}`,
        month: monthStr,
        date: month.toISOString().split('T')[0],
        employeeName: username,
        employeeRole: userRole,
        basic,
        hra,
        transport,
        medical,
        bonus,
        grossSalary,
        tax,
        providentFund,
        insurance,
        totalDeductions,
        netSalary,
        status: i === 0 ? 'pending' : 'paid'
      })
    }

    setPayslips(demoPayslips)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const downloadPayslip = (payslip) => {
    // Create a text representation of the payslip
    const content = `
PAYSLIP - ${payslip.month}
===============================================

Employee: ${payslip.employeeName}
Role: ${payslip.employeeRole}
Payment Date: ${payslip.date}

EARNINGS:
--------------
Basic Salary:         ${formatCurrency(payslip.basic)}
House Rent Allowance: ${formatCurrency(payslip.hra)}
Transport Allowance:  ${formatCurrency(payslip.transport)}
Medical Allowance:    ${formatCurrency(payslip.medical)}
${payslip.bonus > 0 ? `Bonus:                ${formatCurrency(payslip.bonus)}` : ''}

Gross Salary:         ${formatCurrency(payslip.grossSalary)}

DEDUCTIONS:
--------------
Income Tax:           ${formatCurrency(payslip.tax)}
Provident Fund:       ${formatCurrency(payslip.providentFund)}
Insurance:            ${formatCurrency(payslip.insurance)}

Total Deductions:     ${formatCurrency(payslip.totalDeductions)}

===============================================
NET SALARY:           ${formatCurrency(payslip.netSalary)}
===============================================

Generated on: ${new Date().toLocaleString()}
    `.trim()

    // Create and download the file
    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payslip_${payslip.month.replace(' ', '_')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const viewPayslip = (payslip) => {
    setSelectedPayslip(payslip)
  }

  const closeModal = () => {
    setSelectedPayslip(null)
  }

  return (
    <div className="bg-white dark:bg-[#0f3460] rounded-xl p-8 shadow-lg max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#006d77] dark:text-[#83c5be] mb-2">Payslips</h1>
        <p className="text-gray-600 dark:text-gray-400">View and download your salary payslips</p>
      </div>

      {/* Payslips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {payslips.map((payslip) => (
          <div key={payslip.id} className="bg-[#f8f9fa] dark:bg-[#16213e] rounded-xl overflow-hidden border-2 border-[#e9ecef] dark:border-[#2a3f5f] hover:shadow-lg transition-all">
            <div className="bg-gradient-to-br from-[#006d77] to-[#83c5be] p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📄</span>
                <span className="text-white font-semibold text-lg">{payslip.month}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                payslip.status === 'paid'
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
              }`}>
                {payslip.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
              </span>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-[#2a3f5f]">
                <span className="text-sm text-gray-600 dark:text-gray-400">Gross Salary:</span>
                <span className="font-semibold text-[#006d77] dark:text-[#83c5be]">{formatCurrency(payslip.grossSalary)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-[#2a3f5f]">
                <span className="text-sm text-gray-600 dark:text-gray-400">Deductions:</span>
                <span className="font-semibold text-red-600 dark:text-red-400">-{formatCurrency(payslip.totalDeductions)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 bg-[#e7f5ff] dark:bg-[#1a3a5a] p-3 rounded-lg">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Net Salary:</span>
                <span className="font-bold text-lg text-[#006d77] dark:text-[#83c5be]">{formatCurrency(payslip.netSalary)}</span>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-[#0f3460] flex gap-2">
              <button
                className="flex-1 px-4 py-2 bg-gradient-to-br from-[#006d77] to-[#83c5be] text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
                onClick={() => viewPayslip(payslip)}
              >
                👁️ View Details
              </button>
              <button
                className="flex-1 px-4 py-2 bg-[#e29578] hover:bg-[#d28468] text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
                onClick={() => downloadPayslip(payslip)}
              >
                📥 Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payslip Detail Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={closeModal}>
          <div className="bg-white dark:bg-[#0f3460] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-3xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white dark:bg-[#16213e] rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={closeModal}
            >
              ×
            </button>

            <div className="p-8">
              <div className="text-center mb-6 pb-6 border-b-2 border-gray-200 dark:border-[#2a3f5f]">
                <h2 className="text-2xl font-bold text-[#006d77] dark:text-[#83c5be] mb-2">Payslip Details</h2>
                <h3 className="text-xl text-gray-600 dark:text-gray-400">{selectedPayslip.month}</h3>
              </div>

              <div className="bg-[#f8f9fa] dark:bg-[#16213e] p-5 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Employee:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedPayslip.employeeName}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Role:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{selectedPayslip.employeeRole}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Payment Date:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedPayslip.date}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-bold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                  <span>💰</span> Earnings
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-[#2a3f5f]">
                    <span className="text-gray-700 dark:text-gray-300">Basic Salary</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(selectedPayslip.basic)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-[#2a3f5f]">
                    <span className="text-gray-700 dark:text-gray-300">House Rent Allowance</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(selectedPayslip.hra)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-[#2a3f5f]">
                    <span className="text-gray-700 dark:text-gray-300">Transport Allowance</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(selectedPayslip.transport)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-[#2a3f5f]">
                    <span className="text-gray-700 dark:text-gray-300">Medical Allowance</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(selectedPayslip.medical)}</span>
                  </div>
                  {selectedPayslip.bonus > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-200 dark:border-[#2a3f5f]">
                      <span className="text-gray-700 dark:text-gray-300">Bonus</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(selectedPayslip.bonus)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 bg-green-50 dark:bg-green-900/20 px-3 rounded-lg mt-2">
                    <span className="font-bold text-green-700 dark:text-green-400">Gross Salary</span>
                    <span className="font-bold text-green-700 dark:text-green-400">{formatCurrency(selectedPayslip.grossSalary)}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-lg font-bold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                  <span>📉</span> Deductions
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-[#2a3f5f]">
                    <span className="text-gray-700 dark:text-gray-300">Income Tax</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(selectedPayslip.tax)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-[#2a3f5f]">
                    <span className="text-gray-700 dark:text-gray-300">Provident Fund</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(selectedPayslip.providentFund)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200 dark:border-[#2a3f5f]">
                    <span className="text-gray-700 dark:text-gray-300">Insurance</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(selectedPayslip.insurance)}</span>
                  </div>
                  <div className="flex justify-between py-3 bg-red-50 dark:bg-red-900/20 px-3 rounded-lg mt-2">
                    <span className="font-bold text-red-700 dark:text-red-400">Total Deductions</span>
                    <span className="font-bold text-red-700 dark:text-red-400">{formatCurrency(selectedPayslip.totalDeductions)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#006d77] to-[#83c5be] p-5 rounded-xl mb-6">
                <div className="flex justify-between items-center text-white">
                  <span className="text-lg font-bold">NET SALARY</span>
                  <span className="text-2xl font-bold">{formatCurrency(selectedPayslip.netSalary)}</span>
                </div>
              </div>

              <button
                className="w-full px-6 py-3 bg-[#e29578] hover:bg-[#d28468] text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
                onClick={() => downloadPayslip(selectedPayslip)}
              >
                📥 Download Payslip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payslips
