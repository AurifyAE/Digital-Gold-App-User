import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Star, Clock, Loader, ArrowRight, X, ArrowLeft, AlertCircle } from 'lucide-react';
import DirhamGreenIcon from '../../assets/images/Dirham_Greeen.png';
import DirhamBlackIcon from '../../assets/images/Dirham_Black.png';
import { getSchemes, getSelectedSchemes } from '../../api/api';
import Payment from './Payment';

// Toast Component
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className={`rounded-lg px-4 py-3 shadow-lg max-w-sm ${type === 'success'
          ? 'bg-green-500 text-white'
          : type === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-blue-500 text-white'
        }`}>
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

const SchemeList = ({ onViewSelected }) => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        const response = await getSchemes();

        if (response.success) {
          setSchemes(response.data || []);
        } else {
          // If response.success is false but we have data
          if (response.data && response.data.data) {
            setSchemes(response.data.data);
          } else {
            setError('Failed to fetch schemes');
          }
        }
      } catch (err) {
        setError('Error fetching schemes: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, []);

  const formatPrice = (amount, fontSizeRatio = 0.8, color = 'black') => {
    const iconMap = {
      green: DirhamGreenIcon,
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

  const handleSelectScheme = (scheme) => {
    setSelectedScheme(scheme);
    setShowPayment(true);
  };

  const handleBackToSchemes = () => {
    setShowPayment(false);
    setSelectedScheme(null);
  };

  const handlePaymentComplete = (paymentData) => {
    // Handle successful payment
    console.log('Payment completed:', paymentData);

    showToast(`Payment setup successful for ${selectedScheme.name}!`, 'success');
    handleBackToSchemes();

    // Optionally navigate to selected schemes view
    if (onViewSelected) {
      onViewSelected();
    }
  };

  // If showing payment page, render Payment component
  if (showPayment && selectedScheme) {
    return (
      <Payment
        scheme={selectedScheme}
        onPaymentComplete={handlePaymentComplete}
        onBack={handleBackToSchemes}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 px-4">
        <div className="flex items-center space-x-3">
          <Loader className="animate-spin text-indigo-600" size={24} />
          <span className="text-base sm:text-lg text-gray-600">Loading schemes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 mx-4 sm:mx-0">
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

  if (!schemes || schemes.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-gray-500 mb-4">
          <CreditCard size={48} className="mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold">No schemes available</h3>
          <p className="text-sm sm:text-base">Please check back later for available savings schemes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Available Schemes</h2>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg text-gray-600">Choose the perfect savings plan that suits your needs</p>
        </div>
        {onViewSelected && (
          <button
            onClick={onViewSelected}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium text-sm px-4 py-2 rounded-xl flex items-center"
          >
            <ArrowLeft size={18} sm:size={20} className='mr-1' />
            <span>My Schemes</span>
          </button>
        )}
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {schemes.map((scheme) => (
          <div
            key={scheme._id || scheme.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 rounded-xl shadow-lg p-4 sm:p-6 relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100"
          >
            {/* Duration and Monthly Pay */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-1">
                <Clock size={14} sm:size={16} className="text-indigo-500" />
                <span className="text-xs sm:text-sm font-medium text-gray-700">{scheme.months} months</span>
              </div>
            </div>

            {/* Plan Name and Total Amount */}
            <div className="text-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-tight">{scheme.name}</h3>
              <div className="flex items-center justify-center space-x-1">
                <span className="text-2xl sm:text-3xl font-bold text-black-600">
                  {formatPrice(scheme.amount, 1.4, 'black')}
                </span>
              </div>
              <span className="text-xs sm:text-sm text-gray-500">Total Amount</span>
            </div>

            {/* Key Features */}
            <div className="space-y-2 mb-4 sm:mb-6">
              <div className="flex items-center space-x-2">
                <CheckCircle size={14} sm:size={16} className="text-green-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700">Duration: {scheme.months} months</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={14} sm:size={16} className="text-green-500 flex-shrink-0" />
                <span className="flex text-xs sm:text-sm text-gray-700">
                  Monthly: {formatPrice(scheme.monthly_pay, 0.7, 'black')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={14} sm:size={16} className="text-green-500 flex-shrink-0" />
                <span className="flex text-xs sm:text-sm text-gray-700">
                  Bonus: {formatPrice(scheme.bonus, 0.7, 'black')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={14} sm:size={16} className="text-green-500 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-700">Flexible payment options</span>
              </div>
            </div>

            {/* Bonus Highlight */}
            {scheme.bonus > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <Star size={14} sm:size={16} className="text-green-600 flex-shrink-0" fill="currentColor" />
                  <span className="flex text-xs sm:text-sm font-semibold text-green-800">
                    Bonus: {formatPrice(scheme.bonus, 0.7, 'green')}
                  </span>
                </div>
              </div>
            )}

            {/* Select Button */}
            <button
              onClick={() => handleSelectScheme(scheme)}
              className="w-full py-2 sm:py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl group text-sm sm:text-base"
            >
              <CreditCard size={16} sm:size={18} />
              <span>Select Scheme</span>
              <ArrowRight size={14} sm:size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchemeList;