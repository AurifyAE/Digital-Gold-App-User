import React, { useState, useEffect } from 'react';
import { Plus, Target, Calendar, CheckCircle, Clock, AlertCircle, ArrowLeft, AlertTriangle, X } from 'lucide-react';
import DirhamIndigoIcon from '../../assets/images/Dirham_Indigo.png';
import DirhamGreenIcon from '../../assets/images/Dirham_Greeen.png';
import DirhamBlackIcon from '../../assets/images/Dirham_Black.png';
import { getAims, addAim, calculateAim } from '../../api/api';

// Toast Component
const Toast = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Toast disappears after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-in">
      <CheckCircle size={20} />
      <span>{message}</span>
    </div>
  );
};

// KYC Modal Component
const KYCModal = ({ isVisible, onClose, onKYCRedirect }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-yellow-600" size={32} />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            KYC Verification Required
          </h3>
          
          <p className="text-gray-600 mb-6">
            To create new financial aims, you need to complete your KYC (Know Your Customer) verification first. 
            This is required for security and regulatory compliance.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={onKYCRedirect}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 font-semibold transition-colors"
            >
              Complete KYC Verification
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddAim = ({ onAimAdded, onBack, onKYCRequired }) => {
  const [aimData, setAimData] = useState({
    name: '',
    months: '',
    amount: '',
    payment_cycle: 'daily'
  });
  const [calculatedEmi, setCalculatedEmi] = useState(null);
  const [totalPayments, setTotalPayments] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null);
  const [completionDate, setCompletionDate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState({});
  const [showKYCModal, setShowKYCModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAimData({ ...aimData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    if (name === 'amount' || name === 'months' || name === 'payment_cycle') {
      setCalculatedEmi(null);
      setTotalPayments(null);
      setTotalAmount(null);
      setCompletionDate(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!aimData.name.trim()) {
      newErrors.name = 'Aim name is required';
    }

    if (!aimData.months || parseInt(aimData.months) <= 0) {
      newErrors.months = 'Months must be greater than 0';
    }

    if (!aimData.amount || parseFloat(aimData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (calculatedEmi === null) {
      newErrors.general = 'Please calculate EMI first';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForCalculate = () => {
    const newErrors = {};

    if (!aimData.months || parseInt(aimData.months) <= 0) {
      newErrors.months = 'Months must be greater than 0';
    }

    if (!aimData.amount || parseFloat(aimData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors({ ...errors, ...newErrors });
    return Object.keys(newErrors).length === 0;
  };

  const formatPrice = (amount, fontSizeRatio = 0.8, color = 'black') => {
    const iconMap = {
      indigo: DirhamIndigoIcon,
      green: DirhamGreenIcon,
      black: DirhamBlackIcon
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

  const handleKYCRedirect = () => {
    setShowKYCModal(false);
    if (onKYCRequired) {
      onKYCRequired();
    } else {
      console.log('Redirect to KYC verification');
    }
  };

  const handleCalculate = async () => {
    if (!validateForCalculate()) {
      return;
    }

    setIsCalculating(true);
    
    try {
      const calculateData = {
        months: parseInt(aimData.months),
        amount: parseFloat(aimData.amount),
        payment_cycle: aimData.payment_cycle
      };

      const calcResponse = await calculateAim(calculateData);
      
      if (!calcResponse.success) {
        setCalculatedEmi(calcResponse.data.data.calculatedEmi);
        setTotalPayments(calcResponse.data.data.totalPayments);
        setTotalAmount(calcResponse.data.data.totalAmount);
        setCompletionDate(calcResponse.data.data.endDate);
      } else {
        setErrors({ ...errors, general: calcResponse.error || 'Failed to calculate aim. Please try again.' });
      }
    } catch (error) {
      console.error('Error calculating aim:', error);
      setErrors({ ...errors, general: 'Failed to calculate aim. Please try again.' });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const paymentData = {
        name: aimData.name,
        months: parseInt(aimData.months),
        amount: parseFloat(aimData.amount),
        payment_cycle: aimData.payment_cycle,
        calculated_emi: calculatedEmi
      };

      const response = await addAim(paymentData);
      
      if (!response.success) {
        onAimAdded(response.data, aimData.name);
        setAimData({
          name: '',
          months: '',
          amount: '',
          payment_cycle: 'daily'
        });
        setCalculatedEmi(null);
        setTotalPayments(null);
        setTotalAmount(null);
        setCompletionDate(null);
      } else {
        setErrors({ general: 'Failed to add aim. Please try again.' });
      }
    } catch (error) {
      console.error('Error adding aim:', error);
      
      // Check for KYC verification error
      if (error.response?.status === 403) {
        if (error.response.data && typeof error.response.data === 'string') {
          if (error.response.data.includes('User kyc not verified') || 
              error.response.data.toLowerCase().includes('kyc')) {
            setShowKYCModal(true);
            return;
          }
        }
      }
      
      // Check if the error response indicates KYC requirement
      if (error.response?.data?.error === 'KYC_NOT_VERIFIED' || 
          error.response?.data?.message?.toLowerCase().includes('kyc') ||
          error.response?.data?.requiresKYC) {
        setShowKYCModal(true);
      } else {
        setErrors({ general: 'Failed to add aim. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentCycleOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <button
              onClick={onBack}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Add New Aim</h2>
              <p className="text-gray-600">Set a financial goal and track your savings progress</p>
            </div>
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aim Name *
              </label>
              <input
                type="text"
                name="name"
                value={aimData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                placeholder="e.g., Buy a new car, Build house"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <img
                    src={DirhamBlackIcon}
                    alt="AED"
                    style={{ width: '12.8px', height: '12.8px', marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }}
                  />
                  Target Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={aimData.amount}
                  onChange={handleChange}
                  min="1"
                  step="0.01"
                  className={`w-full px-4 py-3 border ${
                    errors.amount ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  placeholder="e.g., 200000"
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Duration (Months) *
                </label>
                <input
                  type="number"
                  name="months"
                  value={aimData.months}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-4 py-3 border ${
                    errors.months ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                  placeholder="e.g., 24"
                />
                {errors.months && (
                  <p className="mt-1 text-sm text-red-600">{errors.months}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Cycle
              </label>
              <select
                name="payment_cycle"
                value={aimData.payment_cycle}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                {paymentCycleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="button"
                onClick={handleCalculate}
                disabled={isCalculating || isSubmitting}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center space-x-2 transition-all duration-200"
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Calculating...</span>
                  </>
                ) : (
                  <>
                    <span>Calculate EMI</span>
                  </>
                )}
              </button>
            </div>

            {calculatedEmi !== null && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">💰 Estimated Payment:</h4>
                <p className="text-lg font-bold text-blue-800">
                  {formatPrice(calculatedEmi, 1.4, 'indigo')} per {aimData.payment_cycle}
                </p>
                <p className="text-sm text-blue-700">
                  Total payments: {totalPayments}
                </p>
                <p className="flex text-sm text-blue-700">
                  Total Amount: {formatPrice(totalAmount, 0.7, 'indigo')}
                </p>
                <p className="text-sm text-blue-700">
                  End Date: {completionDate}
                </p>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting || isCalculating || calculatedEmi === null}
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center space-x-2 transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Adding Aim...</span>
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    <span>Add Aim</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-green-900 mb-2">💡 Tips for Setting Financial Aims:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li className="flex items-center">
                <img
                  src={DirhamGreenIcon}
                  alt="AED"
                  style={{ width: '11.2px', height: '11.2px', marginRight: '4px' }}
                />
                Set realistic and achievable targets
              </li>
              <li className="flex items-center">
                <img
                  src={DirhamGreenIcon}
                  alt="AED"
                  style={{ width: '11.2px', height: '11.2px', marginRight: '4px' }}
                />
                Choose a payment cycle that fits your income schedule
              </li>
              <li className="flex items-center">
                <img
                  src={DirhamGreenIcon}
                  alt="AED"
                  style={{ width: '11.2px', height: '11.2px', marginRight: '4px' }}
                />
                Consider setting up automatic payments to stay consistent
              </li>
              <li className="flex items-center">
                <img
                  src={DirhamGreenIcon}
                  alt="AED"
                  style={{ width: '11.2px', height: '11.2px', marginRight: '4px' }}
                />
                Review your progress regularly and adjust if needed
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* KYC Modal */}
      <KYCModal 
        isVisible={showKYCModal} 
        onClose={() => setShowKYCModal(false)} 
        onKYCRedirect={handleKYCRedirect}
      />
    </>
  );
};

const AimList = ({ aims, onAddAim }) => {
  const formatPrice = (amount, fontSizeRatio = 0.8, color = 'black') => {
    const iconMap = {
      indigo: DirhamIndigoIcon,
      green: DirhamGreenIcon,
      black: DirhamBlackIcon
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

  const getStatusInfo = (aim) => {
    const progress = ((aim.current_saved || 0) / aim.amount) * 100;
    const today = new Date();
    const nextPayment = aim.next_payment_date ? new Date(aim.next_payment_date) : new Date();
    const daysLeft = Math.ceil((nextPayment - today) / (1000 * 60 * 60 * 24));
    
    if (progress >= 100) {
      return { status: 'completed', icon: CheckCircle, color: 'text-green-600', text: 'Completed' };
    } else if (daysLeft < 0) {
      return { status: 'overdue', icon: AlertCircle, color: 'text-red-600', text: 'Payment Overdue' };
    } else if (daysLeft <= 7) {
      return { status: 'urgent', icon: Clock, color: 'text-orange-600', text: `Payment due in ${daysLeft} days` };
    } else {
      return { status: 'active', icon: CheckCircle, color: 'text-blue-600', text: `Next payment: ${daysLeft} days` };
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Your Financial Aims</h2>
          <p className="text-gray-600 mt-1">
            {aims.length} total aim{aims.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onAddAim}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus size={20} />
          <span>Add New Aim</span>
        </button>
      </div>

      {aims.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target size={40} className="text-indigo-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">No aims yet</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start your financial journey by setting your first savings goal. Track your progress and achieve your dreams.
          </p>
          <button
            onClick={onAddAim}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 inline-flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus size={20} />
            <span>Add Your First Aim</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aims.map((aim) => {
            const statusInfo = getStatusInfo(aim);
            const StatusIcon = statusInfo.icon;
            const progress = ((aim.current_saved || 0) / aim.amount) * 100;

            return (
              <div
                key={aim._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">💰</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color.replace('text-', 'text-').replace('600', '800')} bg-opacity-10`}>
                      {aim.payment_cycle}
                    </span>
                  </div>
                  <div className={`flex items-center space-x-1 ${statusInfo.color}`}>
                    <StatusIcon size={16} />
                    <span className="text-xs font-medium">{statusInfo.text}</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {aim.name}
                </h3>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{formatPrice(aim.current_saved || 0, 0.6, 'black')}</span>
                    <span>{formatPrice(aim.amount, 0.6, 'black')}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{aim.months} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment:</span>
                    <span className='flex'>{formatPrice(aim.calculated_emi, 0.7, 'black')}/{aim.payment_cycle === 'weekly' ? 'week' : aim.payment_cycle === 'daily' ? 'day' : 'month'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Payment:</span>
                    <span>{new Date(aim.next_payment_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const AimsApp = ({ user, onKYCRequired }) => {
  const [currentView, setCurrentView] = useState('list');
  const [aims, setAims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ isVisible: false, message: '' });
  const [showKYCModal, setShowKYCModal] = useState(false);

  useEffect(() => {
    fetchAims();
  }, []);

  const fetchAims = async () => {
    try {
      setIsLoading(true);
      const response = await getAims();
      if (!response.success) {
        setAims(response.data.data || []);
      } else {
        console.error('Error fetching aims:', response.error);
        setAims([]);
      }
    } catch (error) {
      console.error('Error fetching aims:', error);
      setAims([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKYCRedirect = () => {
    setShowKYCModal(false);
    if (onKYCRequired) {
      onKYCRequired();
    } else {
      console.log('Redirect to KYC verification');
    }
  };

  const checkKYCStatus = async () => {
    // You can implement a KYC check API call here
    // For now, we'll simulate the check by trying to proceed
    // The actual KYC check will happen when the user tries to submit the aim
    setCurrentView('add');
  };

  const handleAddAim = () => {
    // Check KYC status before proceeding to add aim
    checkKYCStatus();
  };

  const handleAimAdded = async (newAim, aimName) => {
    try {
      await fetchAims();
      setCurrentView('list');
      setToast({ isVisible: true, message: `Aim "${aimName}" created successfully!` });
    } catch (error) {
      console.error('Error refreshing aims after adding:', error);
      setAims(prev => [...prev, newAim]);
      setCurrentView('list');
      setToast({ isVisible: true, message: `Aim "${aimName}" created successfully!` });
    }
  };

  const handleBackToList = () => {
    setCurrentView('list');
    fetchAims();
  };

  const handleToastClose = () => {
    setToast({ isVisible: false, message: '' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your aims...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={handleToastClose}
      />
      <div className="container mx-auto px-4 py-8">
        {currentView === 'list' ? (
          <AimList
            aims={aims}
            onAddAim={handleAddAim}
          />
        ) : (
          <AddAim 
            onAimAdded={handleAimAdded} 
            onBack={handleBackToList}
            onKYCRequired={handleKYCRedirect}
          />
        )}
      </div>

      {/* KYC Modal for main app level */}
      <KYCModal 
        isVisible={showKYCModal} 
        onClose={() => setShowKYCModal(false)} 
        onKYCRedirect={handleKYCRedirect}
      />

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AimsApp;