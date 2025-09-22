import React, { useState } from 'react';
import { ArrowLeft, CreditCard, CheckCircle, Calendar } from 'lucide-react';
import DirhamIndigoIcon from '../../assets/images/Dirham_Indigo.png';
import DirhamGreenIcon from '../../assets/images/Dirham_Greeen.png';
import DirhamBlackIcon from '../../assets/images/Dirham_Black.png';
import LoadingSpinner from '../common/LoadingSpinner';
import { selectScheme } from '../../api/api';

const Payment = ({ scheme, onPaymentComplete, onBack }) => {
  const [paymentData, setPaymentData] = useState({
    pay_amount: scheme?.monthly_pay || '',
    payment_date: new Date().getDate()
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  // Get user ID from localStorage, context, or props
  const uId = localStorage.getItem('userId');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData({ ...paymentData, [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!paymentData.pay_amount || paymentData.pay_amount <= 0) {
      newErrors.pay_amount = 'Payment amount is required and must be greater than 0';
    }

    if (!paymentData.payment_date || paymentData.payment_date < 1 || paymentData.payment_date > 31) {
      newErrors.payment_date = 'Please select a valid payment date (1-31)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare payment data in the required format
      const finalPaymentData = {
        // uId: uId,
        scheme_id: scheme._id,
        pay_amount: parseFloat(paymentData.pay_amount),
        payment_date: parseInt(paymentData.payment_date)
      };

      console.log('Payment data to be sent:', finalPaymentData);
      const response = await selectScheme(finalPaymentData);
      if (response.data.success) {
        console.log('Scheme selected successfully:', response.data);
      } else {
        console.error('Failed to select scheme:', response.data.message);
        setErrors({ general: response.data.message || 'Failed to select scheme. Please try again.' });
        setIsProcessing(false);
        return;
      }

      // Call the completion handler
      onPaymentComplete(finalPaymentData);
    } catch (error) {
      console.error('Payment error:', error);
      setErrors({ general: 'Payment failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (amount, fontSizeRatio = 0.8, color = 'black') => {
    const iconMap = {
      indigo: DirhamIndigoIcon,
      green: DirhamGreenIcon,
      black: DirhamBlackIcon
    };
    const Icon = iconMap[color] || DirhamBlackIcon; // Default to black if color is invalid
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'AED'
    }).format(amount);
    return (
      <span className="flex items-center">
        <img
          src={Icon}
          alt="AED"
          style={{ width: `${fontSizeRatio * 16}px`, height: `${fontSizeRatio * 16}px`, marginRight: '4px' }}
        />
        {formattedAmount.replace('AED', '').trim()}
      </span>
    );
  };

  // Generate day options for payment date
  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={onBack}
              className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-2 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Schemes</span>
            </button>
          </div>

          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <CreditCard className="text-indigo-600" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Setup</h2>
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
              {errors.general}
            </div>
          )}

          <form onSubmit={handlePayment} className="space-y-6">
            {/* Payment Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <img
                    src={DirhamBlackIcon}
                    alt="AED"
                    style={{ width: '11.2px', height: '11.2px' }}
                  />
                  <span>Payment Amount</span>
                </div>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="pay_amount"
                  value={(paymentData.pay_amount).toFixed(2)}
                  onChange={handleChange}
                  min="1"
                  step="0.01"
                  className={`w-full px-4 py-3 border ${errors.pay_amount ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  placeholder="Enter payment amount"
                />
              </div>
              {errors.pay_amount && (
                <p className="mt-1 text-sm text-red-600">{errors.pay_amount}</p>
              )}
              <p className="flex flex-row mt-1 text-sm text-gray-500">
                Recommended: {formatPrice(scheme?.monthly_pay || 0, 0.8, 'black')}
              </p>
              <p className="mt-1 text-sm text-gray-500">(Monthly payment for this scheme)</p>
            </div>

            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Monthly Payment Date</span>
                </div>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="payment_date"
                  value={paymentData.payment_date}
                  onChange={handleChange}
                  min="1"
                  max="31"
                  className={`w-full px-4 py-3 border ${errors.payment_date ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  placeholder="Enter day of the month (1-31)"
                />
              </div>
              {errors.payment_date && (
                <p className="mt-1 text-sm text-red-600">{errors.payment_date}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Choose the date of the month when you want to make payments
              </p>
            </div>

            {/* Payment Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Payment Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Scheme:</span>
                  <span className="font-medium">{scheme?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Amount:</span>
                  <span className="font-medium">{formatPrice(paymentData.pay_amount || 0, 0.8, 'black')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Date:</span>
                  <span className="font-medium">
                    {paymentData.payment_date ? `${paymentData.payment_date} of every month` : 'Not selected'}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg flex items-center justify-center space-x-3 transition-all duration-200"
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner color="white" />
                  <span>Setting up Payment...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  <span>Setup Payment Plan</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Scheme Details */}
        <div className="bg-gray-50 rounded-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Scheme Details</h3>

          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex flex-col items-center mb-6">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">{scheme?.name}</h4>
              <div className="text-center text-3xl font-bold text-indigo-600 mb-1">
                {formatPrice(scheme?.amount || 0, 1.4, 'indigo')}
              </div>
              <p className="text-gray-500">Total Scheme Amount</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Duration:</span>
                <span className="font-semibold text-gray-900">{scheme?.months} months</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Monthly Payment:</span>
                <span className="font-semibold text-gray-900">{formatPrice(scheme?.monthly_pay || 0, 0.8, 'black')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Bonus Amount:</span>
                <span className="font-semibold text-green-600">{formatPrice(scheme?.bonus || 0, 0.8, 'green')}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Total Payments:</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice((scheme?.monthly_pay || 0) * (scheme?.months || 0), 0.8, 'black')}
                </span>
              </div>
            </div>

            {scheme?.bonus > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-sm font-semibold text-green-800">
                    You'll earn {formatPrice(scheme.bonus, 0.8, 'green')} bonus on completion!
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <CheckCircle size={16} className="text-green-500" />
              <span>Flexible payment dates</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle size={16} className="text-green-500" />
              <span>Secure payment processing</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle size={16} className="text-green-500" />
              <span>Bonus rewards on completion</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle size={16} className="text-green-500" />
              <span>Easy online management</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;