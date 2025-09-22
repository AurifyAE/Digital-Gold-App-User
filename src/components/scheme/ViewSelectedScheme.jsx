import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  Star,
  Clock,
  X,
  Calendar,
  TrendingUp,
  Wallet,
  History,
  AlertCircle,
  Download,
  Trophy,
  Target,
  FileText,
  BarChart3
} from 'lucide-react';
import DirhamBlueIcon from '../../assets/images/Dirham_Indigo.png';
import DirhamGreenIcon from '../../assets/images/Dirham_Greeen.png';
import DirhamOrangeIcon from '../../assets/images/Dirham_Orange.png';
import DirhamPurpleIcon from '../../assets/images/Dirham_Purple.png';
import DirhamBlackIcon from '../../assets/images/Dirham_Black.png';
import DirhamWhiteIcon from '../../assets/images/Dirham_White.png';

// Toast Component
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 4000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div
        className={`rounded-xl px-4 py-3 shadow-xl max-w-sm
          ${type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {type === 'success' && <CheckCircle size={18} />}
            {type === 'error' && <AlertCircle size={18} />}
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button onClick={onClose} className="ml-3">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ViewSelectedScheme = ({ selectedScheme, onBack }) => {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const hideToast = () => setToast(null);

  const formatPrice = (amount, fontSizeRatio = 0.8, color = 'black') => {
    const iconMap = {
      blue: DirhamBlueIcon,
      green: DirhamGreenIcon,
      orange: DirhamOrangeIcon,
      purple: DirhamPurpleIcon,
      black: DirhamBlackIcon,
      white: DirhamWhiteIcon
    };
    const Icon = iconMap[color] || DirhamBlackIcon; 
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return (
      <span className="flex items-center">
        <img
          src={Icon}
          alt="AED"
          style={{ width: `${fontSizeRatio * 16}px`, height: `${fontSizeRatio * 16}px`, marginRight: '4px' }}
        />
        {formattedAmount}
      </span>
    );
  };

  const formatDate = dateString =>
    new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

  const formatDateTime = dateString =>
    new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const calculateProgress = scheme => {
    const totalAmount = scheme.scheme_id.amount;
    const paidAmount = totalAmount - scheme.balance_payout;
    return (paidAmount / totalAmount) * 100;
  };

  const calculatePaymentsMade = scheme => scheme.payment_history.length;
  const calculateRemainingPayments = scheme =>
    scheme.scheme_id.months - calculatePaymentsMade(scheme);

  const getNextPaymentDate = paymentDate => {
    const today = new Date();
    const nextPayment = new Date(today.getFullYear(), today.getMonth(), paymentDate);
    if (nextPayment <= today) nextPayment.setMonth(nextPayment.getMonth() + 1);
    return nextPayment;
  };

  const getSchemeStartDate = () => {
    if (selectedScheme.payment_history.length === 0) {
      return new Date(selectedScheme.selectedAt || Date.now());
    }
    const firstPayment = selectedScheme.payment_history
      .sort((a, b) => new Date(a.paidAt) - new Date(b.paidAt))[0];
    return new Date(firstPayment.paidAt);
  };

  const getExpectedEndDate = () => {
    const startDate = getSchemeStartDate();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + selectedScheme.scheme_id.months);
    return endDate;
  };

  if (!selectedScheme) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-gray-400"></AlertCircle>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Scheme not found</h3>
          <button
            onClick={onBack}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const scheme = selectedScheme.scheme_id;
  const progress = calculateProgress(selectedScheme);
  const paymentsMade = calculatePaymentsMade(selectedScheme);
  const remainingPayments = calculateRemainingPayments(selectedScheme);
  const nextPaymentDate = getNextPaymentDate(selectedScheme.payment_date);
  const startDate = getSchemeStartDate();
  const expectedEndDate = getExpectedEndDate();
  const isCompleted = remainingPayments <= 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Schemes
        </button>
      </div>

      {/* Scheme Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{scheme.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-indigo-100">
              <span className="flex items-center gap-1">
                <Clock size={16} />
                {scheme.months} months
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                Started: {formatDate(startDate)}
              </span>
              <span className="flex items-center gap-1">
                <Target size={16} />
                Expected completion: {formatDate(expectedEndDate)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl md:text-4xl font-bold">{formatPrice(scheme.amount, 1.7, 'white')}</div>
            <div className="text-indigo-200">Total Target Amount</div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 size={20} />
            Progress Overview
          </h2>
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <div className="flex items-center gap-2 text-green-600">
                <Trophy size={20} />
                <span className="font-semibold">Completed!</span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-indigo-600">{progress.toFixed(1)}%</span>
            )}
          </div>
        </div>

        <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden mb-6">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full transition-all duration-500"
            style={{width: `${progress}%`}}
          ></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{paymentsMade}</div>
            <div className="text-sm text-gray-600">Payments Made</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{remainingPayments}</div>
            <div className="text-sm text-gray-600">Remaining</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{formatPrice(scheme.amount - selectedScheme.balance_payout, 1.1, 'green')}</div>
            <div className="text-sm text-gray-600">Amount Paid</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{formatPrice(selectedScheme.balance_payout, 1.1, 'purple')}</div>
            <div className="text-sm text-gray-600">Balance</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Scheme Details */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={18} />
            Scheme Details
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Monthly Payment</span>
              <span className="font-semibold text-gray-900">{formatPrice(scheme.monthly_pay, 0.8, 'black')}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Bonus Amount</span>
              <span className="font-semibold text-green-600">{formatPrice(scheme.bonus, 0.8, 'green')}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Duration</span>
              <span className="font-semibold text-gray-900">{scheme.months} months</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Payment Date</span>
              <span className="font-semibold text-gray-900">{selectedScheme.payment_date} of every month</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Next Payment</span>
              <span className="font-semibold text-indigo-600">{isCompleted ? 'Completed' : formatDate(nextPaymentDate)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Status</span>
              <span className={`font-semibold px-2 py-1 rounded-full text-xs ${isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {isCompleted ? 'Completed' : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <History size={20} />
            Payment History
          </h3>
          
          {selectedScheme.payment_history.length === 0 ? (
            <div className="text-center py-8">
              <Clock size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No payments made yet</p>
              <p className="text-sm text-gray-400 mt-1">Your payment history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-4 py-2 px-4 bg-gray-50 rounded-lg text-sm font-medium text-gray-600">
                <div>Date & Time</div>
                <div>Amount</div>
                <div>Payment #</div>
                <div>Status</div>
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-2">
                {selectedScheme.payment_history
                  .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))
                  .map((payment, index) => (
                    <div
                      key={payment._id}
                      className="grid grid-cols-4 gap-4 py-3 px-4 bg-green-50 rounded-lg border-l-4 border-green-400"
                    >
                      <div className="text-sm text-gray-700">
                        {formatDateTime(payment.paidAt)}
                      </div>
                      <div className="text-sm font-semibold text-green-600">
                        {formatPrice(payment.paid_amount, 0.6, 'green')}
                      </div>
                      <div className="text-sm text-gray-600">
                        #{selectedScheme.payment_history.length - index}
                      </div>
                      <div>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          <CheckCircle size={12} />
                          Completed
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
              
              {/* Summary */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Total Payments Made:</span>
                  <span className="font-semibold text-gray-900">{selectedScheme.payment_history.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-gray-600">Total Amount Paid:</span>
                  <span className="font-semibold text-green-600">
                    {formatPrice(selectedScheme.payment_history.reduce((sum, p) => sum + p.paid_amount, 0), 0.6, 'green')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-gray-600">Average Payment:</span>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(selectedScheme.payment_history.reduce((sum, p) => sum + p.paid_amount, 0) / selectedScheme.payment_history.length, 0.6, 'black')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Wallet size={20} />
          Financial Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-blue-800">Total Investment</h4>
              <TrendingUp size={16} className="text-blue-600" />
            </div>
            <div className="text-xl font-bold text-blue-700">{formatPrice(scheme.amount - scheme.bonus, 0.9, 'blue')}</div>
            <div className="text-xs text-blue-600 mt-1">Principal amount without bonus</div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-green-800">Bonus Earned</h4>
              <Star size={16} className="text-green-600" />
            </div>
            <div className="text-xl font-bold text-green-700">{formatPrice(scheme.bonus, 0.9, 'green')}</div>
            <div className="text-xs text-green-600 mt-1">Extra earnings on completion</div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-purple-800">Total Returns</h4>
              <Trophy size={16} className="text-purple-600" />
            </div>
            <div className="text-xl font-bold text-purple-700">{formatPrice(scheme.amount, 0.9, 'purple')}</div>
            <div className="text-xs text-purple-600 mt-1">Amount you'll receive</div>
          </div>
          
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-orange-800">ROI</h4>
              <TrendingUp size={16} className="text-orange-600" />
            </div>
            <div className="text-xl font-bold text-orange-700">
              {((scheme.bonus / (scheme.amount - scheme.bonus)) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-orange-600 mt-1">Return on investment</div>
          </div>
        </div>
        
        {isCompleted && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold mb-1">🎉 Congratulations!</h4>
                <p className="text-green-100">You have successfully completed this savings scheme.</p>
              </div>
              <Trophy size={32} className="text-green-200" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewSelectedScheme;