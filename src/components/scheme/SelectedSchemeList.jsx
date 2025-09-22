import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle,
  Star,
  Clock,
  Loader,
  ArrowLeft,
  X,
  Calendar,
  TrendingUp,
  Wallet,
  AlertCircle,
  Eye
} from 'lucide-react';
import DirhamGreenIcon from '../../assets/images/Dirham_Greeen.png';
import DirhamOrangeIcon from '../../assets/images/Dirham_Orange.png';
import DirhamPurpleIcon from '../../assets/images/Dirham_Purple.png';
import DirhamBlackIcon from '../../assets/images/Dirham_Black.png';
import { getSelectedSchemes } from '../../api/api';

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

const SelectedSchemes = ({ onBack, onViewScheme }) => {
  const [selectedSchemes, setSelectedSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const hideToast = () => setToast(null);

  useEffect(() => {
    const fetchSelectedSchemes = async () => {
      try {
        setLoading(true);
        const response = await getSelectedSchemes();
        if (!response.success) {
          setSelectedSchemes(response.data.data || []);
        } else {
          setError('Failed to fetch selected schemes');
        }
      } catch (err) {
        setError('Error fetching selected schemes: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSelectedSchemes();
  }, []);

  const formatPrice = (amount, fontSizeRatio = 0.8, color = 'black') => {
    const iconMap = {
      green: DirhamGreenIcon,
      orange: DirhamOrangeIcon,
      purple: DirhamPurpleIcon,
      black: DirhamBlackIcon
    };
    const Icon = iconMap[color] || DirhamBlackIcon; // Default to black if color is invalid
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
    return nextPayment.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  };

  const handleViewScheme = (scheme) => {
    if (onViewScheme) {
      onViewScheme(scheme);
    } else {
      console.error('onViewScheme callback not provided to SelectedSchemes component');
      showToast('View functionality not available', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 px-4">
        <div className="flex items-center space-x-3">
          <Loader className="animate-spin text-indigo-600" size={24} />
          <span className="text-base sm:text-lg text-gray-600">Loading your schemes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 mx-4 sm:mx-0">
        <div className="flex items-center space-x-3">
          <div className="text-red-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-red-900">Error Loading Schemes</h3>
            <p className="text-sm sm:text-base text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedSchemes || selectedSchemes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <CreditCard size={48} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">No selected schemes</h3>
        <p className="text-sm sm:text-base mb-6 text-gray-500">
          You haven't selected any savings schemes yet.
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors duration-200"
          >
            Browse Available Schemes
          </button>
        )}
      </div>
    );
  }

  // Totals
  const totalSchemes = selectedSchemes.length;
  const totalInvested = selectedSchemes.reduce((sum, s) => sum + (s.scheme_id.amount - s.balance_payout), 0);
  const totalPendingBalance = selectedSchemes.reduce((sum, s) => sum + s.balance_payout, 0);
  const totalBonus = selectedSchemes.reduce((sum, s) => sum + s.scheme_id.bonus, 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      <div className="flex flex-col gap-y-2 sm:flex-row sm:justify-between sm:items-center mb-6">
        <div>
          <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-gray-900">My Selected Schemes</h2>
          <p className="mt-0.5 text-sm sm:text-base text-gray-600">
            Track your savings progress
          </p>
        </div>
        {onBack && (
          <button
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium text-sm px-4 py-2 rounded-xl flex items-center"
            onClick={onBack}
          >
            View All Schemes
            <ArrowLeft size={18} className="rotate-180 ml-1" />
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Active Schemes</p>
          <p className="text-3xl max-sm:text-xl font-bold text-indigo-600">{totalSchemes}</p>
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-indigo-100 rounded-full flex items-center justify-center self-end">
            <CreditCard size={24} className="text-indigo-600" />
          </div>
        </div>
        <div className="flex flex-col justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Total Invested</p>
          <p className="text-3xl max-sm:text-xl font-bold text-green-600">{formatPrice(totalInvested, 1.4, 'green')}</p>
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center self-end">
            <TrendingUp size={24} className="text-green-600" />
          </div>
        </div>
        <div className="flex flex-col justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Pending Balance</p>
          <p className="text-3xl max-sm:text-xl font-bold text-orange-600">{formatPrice(totalPendingBalance, 1.4, 'orange')}</p>
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-100 rounded-full flex items-center justify-center self-end">
            <Wallet size={24} className="text-orange-600" />
          </div>
        </div>
        <div className="flex flex-col justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Total Bonus</p>
          <p className="text-3xl max-sm:text-xl font-bold text-purple-600">{formatPrice(totalBonus, 1.4, 'purple')}</p>
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-full flex items-center justify-center self-end">
            <Star size={24} className="text-purple-600" />
          </div>
        </div>
      </div>

      {/* Schemes List - Minimal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedSchemes.map(selectedScheme => {
          const scheme = selectedScheme.scheme_id;
          const progress = calculateProgress(selectedScheme);
          const paymentsMade = calculatePaymentsMade(selectedScheme);
          const remainingPayments = calculateRemainingPayments(selectedScheme);
          const nextPaymentDate = getNextPaymentDate(selectedScheme.payment_date);

          return (
            <div
              key={selectedScheme._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-lg transition"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 pr-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{scheme.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Clock size={14} />
                    <span>{paymentsMade}/{scheme.months}</span>
                    <span>•</span>
                    <Calendar size={14} />
                    <span>{nextPaymentDate}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleViewScheme(selectedScheme);
                  }}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex-shrink-0"
                  title="View Details"
                >
                  <Eye size={18} />
                </button>
              </div>

              {/* Progress */}
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span className="text-indigo-600 font-medium">{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
              </div>

              {remainingPayments > 0 && (
                <p className="text-left text-xs text-gray-500 mb-4">
                  {remainingPayments} payments remaining
                </p>
              )}

              {/* Key Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center text-center py-2 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-900">{formatPrice(scheme.amount, 0.8, 'black')}</div>
                  <div className="text-xs text-gray-600">Total Amount</div>
                </div>
                <div className="flex flex-col items-center text-center py-2 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">{formatPrice(selectedScheme.balance_payout, 0.8, 'orange')}</div>
                  <div className="text-xs text-gray-600">Balance</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectedSchemes;