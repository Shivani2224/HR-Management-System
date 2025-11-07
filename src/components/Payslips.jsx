import { useState, useEffect } from 'react'
import './Payslips.css'

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
    <div className="payslips-container">
      <div className="payslips-header">
        <h1>Payslips</h1>
        <p>View and download your salary payslips</p>
      </div>

      {/* Payslips Grid */}
      <div className="payslips-grid">
        {payslips.map((payslip) => (
          <div key={payslip.id} className="payslip-card">
            <div className="payslip-card-header">
              <div className="month-info">
                <span className="month-icon">📄</span>
                <span className="month-text">{payslip.month}</span>
              </div>
              <span className={`status-badge ${payslip.status}`}>
                {payslip.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
              </span>
            </div>

            <div className="payslip-summary">
              <div className="summary-row">
                <span className="summary-label">Gross Salary:</span>
                <span className="summary-value">{formatCurrency(payslip.grossSalary)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Deductions:</span>
                <span className="summary-value deduction">-{formatCurrency(payslip.totalDeductions)}</span>
              </div>
              <div className="summary-row net">
                <span className="summary-label">Net Salary:</span>
                <span className="summary-value">{formatCurrency(payslip.netSalary)}</span>
              </div>
            </div>

            <div className="payslip-actions">
              <button className="view-btn" onClick={() => viewPayslip(payslip)}>
                👁️ View Details
              </button>
              <button className="download-btn" onClick={() => downloadPayslip(payslip)}>
                📥 Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payslip Detail Modal */}
      {selectedPayslip && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>

            <div className="payslip-detail">
              <div className="payslip-detail-header">
                <h2>Payslip Details</h2>
                <h3>{selectedPayslip.month}</h3>
              </div>

              <div className="employee-info-section">
                <div className="info-row">
                  <span>Employee:</span>
                  <span>{selectedPayslip.employeeName}</span>
                </div>
                <div className="info-row">
                  <span>Role:</span>
                  <span>{selectedPayslip.employeeRole}</span>
                </div>
                <div className="info-row">
                  <span>Payment Date:</span>
                  <span>{selectedPayslip.date}</span>
                </div>
              </div>

              <div className="earnings-section">
                <h4>Earnings</h4>
                <div className="detail-row">
                  <span>Basic Salary</span>
                  <span>{formatCurrency(selectedPayslip.basic)}</span>
                </div>
                <div className="detail-row">
                  <span>House Rent Allowance</span>
                  <span>{formatCurrency(selectedPayslip.hra)}</span>
                </div>
                <div className="detail-row">
                  <span>Transport Allowance</span>
                  <span>{formatCurrency(selectedPayslip.transport)}</span>
                </div>
                <div className="detail-row">
                  <span>Medical Allowance</span>
                  <span>{formatCurrency(selectedPayslip.medical)}</span>
                </div>
                {selectedPayslip.bonus > 0 && (
                  <div className="detail-row">
                    <span>Bonus</span>
                    <span>{formatCurrency(selectedPayslip.bonus)}</span>
                  </div>
                )}
                <div className="detail-row total">
                  <span>Gross Salary</span>
                  <span>{formatCurrency(selectedPayslip.grossSalary)}</span>
                </div>
              </div>

              <div className="deductions-section">
                <h4>Deductions</h4>
                <div className="detail-row">
                  <span>Income Tax</span>
                  <span>{formatCurrency(selectedPayslip.tax)}</span>
                </div>
                <div className="detail-row">
                  <span>Provident Fund</span>
                  <span>{formatCurrency(selectedPayslip.providentFund)}</span>
                </div>
                <div className="detail-row">
                  <span>Insurance</span>
                  <span>{formatCurrency(selectedPayslip.insurance)}</span>
                </div>
                <div className="detail-row total">
                  <span>Total Deductions</span>
                  <span>{formatCurrency(selectedPayslip.totalDeductions)}</span>
                </div>
              </div>

              <div className="net-salary-section">
                <span>NET SALARY</span>
                <span>{formatCurrency(selectedPayslip.netSalary)}</span>
              </div>

              <button className="download-detail-btn" onClick={() => downloadPayslip(selectedPayslip)}>
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
