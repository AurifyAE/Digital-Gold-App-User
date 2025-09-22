import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { depositToWallet, transactionHistory } from '../../api/api';
import { Wallet, Plus, CreditCard, ArrowUpRight, ArrowDownLeft, X, Check, AlertCircle } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import DirhamRedIcon from '../../assets/images/Dirham_Red.png';
import DirhamGreenIcon from '../../assets/images/Dirham_Greeen.png';
import DirhamBlackIcon from '../../assets/images/Dirham_Black.png';
import DirhamWhiteIcon from '../../assets/images/Dirham_White.png';

const WalletPage = () => {
    const { user } = useAuth();
    const [walletData, setWalletData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [isDepositing, setIsDepositing] = useState(false);
    const [depositSuccess, setDepositSuccess] = useState(false);
    const [depositError, setDepositError] = useState('');
    const [transactions, setTransactions] = useState([]);

    const {
        fullName,
        walletBalance,
        loading,
        isProfileComplete,
        refreshUser
    } = useUser();

    const uId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch transaction history from API
                const response = await transactionHistory();
                if (!response.success) {
                    const { data } = response.data;

                    // Set wallet data from API response
                    const walletInfo = data[0]?.wallet[0] || {};
                    const mockWalletData = {
                        userId: user?.id || '68b7e7882a5cc44cff26cae7',
                        balance: walletBalance || walletInfo.balance || 0,
                        currency: 'AED',
                        lastUpdated: new Date().toISOString(),
                        debit: walletInfo.debit || 0,
                        credit: walletInfo.credit || 0
                    };
                    setWalletData(mockWalletData);

                    // Combine wallet, scheme, and AIM payment histories
                    const walletPayments = data[0]?.wallet[0]?.paymentHistory || [];
                    const schemePayments = data[0]?.selectedSchemes?.flatMap(scheme => 
                        scheme.paymentHistory.map(payment => ({
                            ...payment,
                            schemeName: scheme.schemeDetails.name
                        }))
                    ) || [];
                    const aimPayments = data[0]?.aimPayments || [];

                    // Combine and format transactions
                    const combinedTransactions = [
                        ...walletPayments.map(payment => ({
                            id: payment._id,
                            type: 'deposit',
                            amount: payment.paid_amount,
                            date: payment.paidAt,
                            description: 'Wallet Deposit',
                            status: payment.status,
                            transactionId: payment.transaction_id
                        })),
                        ...schemePayments.map(payment => ({
                            id: payment._id,
                            type: 'withdrawal',
                            amount: payment.paid_amount,
                            date: payment.paidAt,
                            description: `Payment for ${payment.schemeName}`,
                            status: payment.status,
                            transactionId: payment.transaction_id
                        })),
                        ...aimPayments.map(payment => ({
                            id: payment._id,
                            type: 'aim',
                            amount: payment.amount,
                            date: payment.createdAt,
                            description: 'AIM Payment',
                            status: payment.status,
                            transactionId: payment.transaction_id
                        }))
                    ];

                    // Sort transactions by date (most recent first)
                    combinedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setTransactions(combinedTransactions);
                } else {
                    console.error('Failed to fetch transaction history:', response.message);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user, uId, walletBalance]);

    const handleDepositSubmit = async () => {
        if (!depositAmount || parseFloat(depositAmount) <= 0) {
            setDepositError('Please enter a valid amount');
            return;
        }
        if (!transactionId.trim()) {
            setDepositError('Please enter a transaction ID');
            return;
        }

        setIsDepositing(true);
        setDepositError('');

        try {
            const depositData = {
                transaction_id: transactionId.trim(),
                amount: parseFloat(depositAmount)
            };

            await depositToWallet(depositData);

            // Add the new deposit to the transaction list with 'requested' status
            const newTransaction = {
                id: `temp-${Date.now()}`, // Temporary ID until refreshed from API
                type: 'deposit',
                amount: parseFloat(depositAmount),
                date: new Date().toISOString(),
                description: 'Wallet Deposit',
                status: 'requested',
                transactionId: transactionId.trim()
            };

            setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));

            setDepositSuccess(true);
            setDepositAmount('');
            setTransactionId('');

            setTimeout(() => {
                setDepositSuccess(false);
                setShowDepositModal(false);
            }, 3000);

            // Refresh transaction history after deposit
            const response = await transactionHistory();
            if (!response.success) {
                const {data} = response.data;
                const walletInfo = data[0]?.wallet[0] || {};
                setWalletData(prev => ({
                    ...prev,
                    balance: walletBalance || walletInfo.balance || 0,
                    debit: walletInfo.debit || 0,
                    credit: walletInfo.credit || 0,
                    lastUpdated: new Date().toISOString()
                }));

                const walletPayments = data[0]?.wallet[0]?.paymentHistory || [];
                const schemePayments = data[0]?.selectedSchemes?.flatMap(scheme => 
                    scheme.paymentHistory.map(payment => ({
                        ...payment,
                        schemeName: scheme.schemeDetails.name
                    }))
                ) || [];
                const aimPayments = data[0]?.aimPayments || [];

                const combinedTransactions = [
                    ...walletPayments.map(payment => ({
                        id: payment._id,
                        type: 'deposit',
                        amount: payment.paid_amount,
                        date: payment.paidAt,
                        description: 'Wallet Deposit',
                        status: payment.status,
                        transactionId: payment.transaction_id
                    })),
                    ...schemePayments.map(payment => ({
                        id: payment._id,
                        type: 'withdrawal',
                        amount: payment.paid_amount,
                        date: payment.paidAt,
                        description: `Payment for ${payment.schemeName}`,
                        status: payment.status,
                        transactionId: payment.transaction_id
                    })),
                    ...aimPayments.map(payment => ({
                        id: payment._id,
                        type: 'aim',
                        amount: payment.amount,
                        date: payment.createdAt,
                        description: 'AIM Payment',
                        status: payment.status,
                        transactionId: payment.transaction_id
                    }))
                ];

                combinedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
                setTransactions(combinedTransactions);
            }
        } catch (error) {
            setDepositError(error.message || 'Failed to deposit money. Please try again.');
        } finally {
            setIsDepositing(false);
        }
    };

    const handleModalClose = () => {
        setShowDepositModal(false);
        setDepositAmount('');
        setTransactionId('');
        setDepositError('');
        setDepositSuccess(false);
    };

    const formatPrice = (amount, fontSizeRatio = 0.8, color = 'black') => {
        const iconMap = {
            red: DirhamRedIcon,
            green: DirhamGreenIcon,
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto space-y-6 sm:space-y-8">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center space-x-3">
                            <Wallet className="text-indigo-600" size={32} />
                            <span>My Wallet</span>
                        </h1>
                        <p className="text-gray-600 mt-1">Manage your wallet balance and transactions</p>
                    </div>
                </div>

                {/* Wallet Balance Card */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 sm:p-8 text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div>
                            <p className="text-indigo-100 text-sm sm:text-base mb-2">Available Balance</p>
                            <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                                {formatPrice(walletBalance, 1.8, 'white')}
                            </h2>
                            <p className="text-indigo-100 text-xs sm:text-sm">
                                Last updated: {formatDate(walletData.lastUpdated)}
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowDepositModal(true)}
                                className="bg-white/20 backdrop-blur-sm text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-white/30 transition-colors duration-200 flex items-center space-x-2"
                            >
                                <Plus size={20} />
                                <span>Add Money</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Deposits</p>
                                <p className="text-xl sm:text-2xl font-bold text-green-600">
                                    {formatPrice(walletData.credit, 1.1, 'green')}
                                </p>
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <ArrowUpRight className="text-green-600" size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                                <p className="text-xl sm:text-2xl font-bold text-red-600">
                                    {formatPrice(walletData.debit, 1.1, 'red')}
                                </p>
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <ArrowDownLeft className="text-red-600" size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Transactions</p>
                                <p className="text-xl sm:text-2xl font-bold text-indigo-600">
                                    {transactions.length}
                                </p>
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                <CreditCard className="text-indigo-600" size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Recent Transactions</h3>

                    {transactions.length === 0 ? (
                        <div className="text-center py-8">
                            <CreditCard size={48} className="text-gray-400 mx-auto mb-4" />
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h4>
                            <p className="text-gray-600">Your transaction history will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {transactions.map((transaction) => (
                                <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            transaction.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                                        }`}>
                                            {transaction.type === 'deposit' ? (
                                                <ArrowUpRight className="text-green-600" size={20} />
                                            ) : (
                                                <ArrowDownLeft className="text-red-600" size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                                            <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
                                            <p className="text-sm text-gray-600">ID: {transaction.transactionId}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`flex font-semibold ${
                                            transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {transaction.type === 'deposit' ? '+' : '-'}{formatPrice(transaction.amount, 0.8, transaction.type === 'deposit' ? 'green' : 'red')}
                                        </p>
                                        <p className="text-xs text-gray-500 capitalize">{transaction.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
                        <button
                            onClick={handleModalClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <img
                                    src={DirhamWhiteIcon}
                                    alt="AED"
                                    style={{ width: '24px', height: '24px' }}
                                />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">Add Money to Wallet</h3>
                            <p className="text-gray-600 text-sm mt-1">Enter the amount and transaction ID</p>
                        </div>

                        {depositSuccess ? (
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <img
                                        src={DirhamGreenIcon}
                                        alt="AED"
                                        style={{ width: '24px', height: '24px' }}
                                    />
                                </div>
                                <h4 className="text-lg font-semibold text-green-600 mb-2">Deposit Request Successful!</h4>
                                <p className="text-gray-600">Amount will be added to your wallet once Admin accepts.</p>
                            </div>
                        ) : (
                            <div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Amount (AED)
                                    </label>
                                    <div className="relative">
                                        <img
                                            src={DirhamBlackIcon}
                                            alt="AED"
                                            style={{ width: '16px', height: '16px', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                                        />
                                        <input
                                            type="number"
                                            value={depositAmount}
                                            onChange={(e) => setDepositAmount(e.target.value)}
                                            placeholder="0.00"
                                            min="1"
                                            step="0.01"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            disabled={isDepositing}
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Transaction ID
                                    </label>
                                    <input
                                        type="text"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        placeholder="Enter transaction ID"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        disabled={isDepositing}
                                    />
                                </div>

                                {depositError && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                                        <AlertCircle className="text-red-500" size={16} />
                                        <p className="text-red-700 text-sm">{depositError}</p>
                                    </div>
                                )}

                                <div className="flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={handleModalClose}
                                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                        disabled={isDepositing}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDepositSubmit}
                                        className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isDepositing}
                                    >
                                        {isDepositing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Plus size={16} />
                                                <span>Add Money</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletPage;