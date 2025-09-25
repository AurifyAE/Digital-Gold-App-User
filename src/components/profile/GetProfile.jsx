import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Edit, MapPin, Mail, Phone, Calendar, Award, Settings, Plus, Save, X, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import { getProfile, addAddress, updateAddress, updateProfile } from '../../api/api';

const GetProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [address, setAddress] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const [formData, setFormData] = useState({
        street: '',
        city: '',
        district: '',
        state: '',
        country: '',
        postal_code: ''
    });
    const [profileFormData, setProfileFormData] = useState({
        first_name: '',
        last_name: '',
        mobile_no: '',
        email: '',
        date_of_birth: '',
        gender: ''
    });

    useEffect(() => {
        fetchProfile();
    }, [user]);

    const calculateProfileCompletion = (profileData) => {
        const completionItems = [
            {
                name: 'Personal Information',
                completed: !!(profileData.first_name && profileData.last_name && profileData.email && profileData.mobile_no && profileData.date_of_birth && profileData.gender),
                weight: 40,
                description: 'Complete your basic profile details'
            },
            {
                name: 'Address Information',
                completed: profileData.address && profileData.address.length > 0,
                weight: 30,
                description: 'Add your address for better service'
            },
            {
                name: 'KYC Verification',
                completed: profileData.kyc && profileData.kyc.length > 0,
                weight: 30,
                description: 'Complete KYC verification for account security'
            }
        ];

        const totalWeight = completionItems.reduce((sum, item) => sum + item.weight, 0);
        const completedWeight = completionItems.reduce((sum, item) => sum + (item.completed ? item.weight : 0), 0);
        const completionPercentage = Math.round((completedWeight / totalWeight) * 100);

        return {
            percentage: completionPercentage,
            items: completionItems,
            isComplete: completionPercentage === 100
        };
    };

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const response = await getProfile();
            const profileData = response.data.data[0];

            const mappedProfile = {
                id: profileData._id,
                first_name: profileData.first_name,
                last_name: profileData.last_name,
                name: `${profileData.first_name} ${profileData.last_name}`,
                email: profileData.email,
                phone: profileData.mobile_no,
                dateOfBirth: profileData.date_of_birth,
                gender: profileData.gender,
                joinDate: profileData.createdAt,
                location: profileData.address[0]?.city || 'Unknown',
                bio: 'Passionate about technology and continuous learning.',
                website: null,
                occupation: null,
                company: null,
                profileImage: null,
                hasKYC: profileData.kyc && profileData.kyc.length > 0,
                stats: {
                    totalSchemes: 3,
                    activeAims: 5,
                    completedAims: 12,
                    membershipDays: Math.floor((new Date() - new Date(profileData.createdAt)) / (1000 * 60 * 60 * 24))
                }
            };

            const addressData = profileData.address && profileData.address.length > 0 ? {
                id: profileData.address[0]._id,
                street: profileData.address[0].street,
                city: profileData.address[0].city,
                district: profileData.address[0].district || '',
                state: profileData.address[0].state,
                country: profileData.address[0].country || '',
                postal_code: profileData.address[0].postal_code
            } : null;

            setProfile(mappedProfile);
            setAddress(addressData);

            setProfileFormData({
                first_name: profileData.first_name || '',
                last_name: profileData.last_name || '',
                email: profileData.email || '',
                mobile_no: profileData.mobile_no || '',
                date_of_birth: profileData.date_of_birth ? profileData.date_of_birth.split('T')[0] : '',
                gender: profileData.gender || ''
            });

            if (addressData) {
                setFormData({
                    street: addressData.street || '',
                    city: addressData.city || '',
                    district: addressData.district || '',
                    state: addressData.state || '',
                    country: addressData.country || '',
                    postal_code: addressData.postal_code || ''
                });
            }

            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfileInputChange = (e) => {
        const { name, value } = e.target;
        setProfileFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddAddress = () => {
        setIsEditMode(false);
        setFormData({
            street: '',
            city: '',
            district: '',
            state: '',
            country: '',
            postal_code: ''
        });
        setShowAddressForm(true);
    };

    const handleEditAddress = () => {
        setIsEditMode(true);
        setShowAddressForm(true);
    };

    const handleEditProfile = () => {
        setShowProfileEdit(true);
    };

    const handleSubmitAddress = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await updateAddress({
                    ...formData,
                    id: address.id
                });
            } else {
                await addAddress(formData);
            }

            await fetchProfile();
            setShowAddressForm(false);
        } catch (error) {
            console.error('Error saving address:', error);
        }
    };

    const handleSubmitProfile = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(profileFormData);
            await fetchProfile();
            setShowProfileEdit(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleCancel = () => {
        setShowAddressForm(false);
        if (address) {
            setFormData({
                street: address.street || '',
                city: address.city || '',
                district: address.district || '',
                state: address.state || '',
                country: address.country || '',
                postal_code: address.postal_code || ''
            });
        }
    };

    const handleCancelProfile = () => {
        setShowProfileEdit(false);
        setProfileFormData({
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            mobile_no: profile.phone || '',
            date_of_birth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
            gender: profile.gender || ''
        });
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const profileCompletion = calculateProfileCompletion({
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        mobile_no: profile.phone,
        date_of_birth: profile.dateOfBirth,
        gender: profile.gender,
        address: address ? [address] : [],
        kyc: profile.hasKYC ? [{}] : []
    });

    return (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-2 sm:p-4">
            {/* Existing Profile Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 sm:p-6 lg:p-8 text-white">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                    <div className="relative flex-shrink-0">
                        {profile.profileImage ? (
                            <img
                                src={profile.profileImage}
                                alt={`${profile.first_name} ${profile.last_name}`}
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg"
                            />
                        ) : (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                <span className="text-xl sm:text-2xl font-bold text-white">
                                    {getInitials(profile.name)}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{profile.name}</h1>
                        <div className="flex flex-col justify-center md:justify-start sm:gap-2 text-xs sm:text-sm">
                            <div className="flex items-center space-x-1">
                                <Mail size={14} className="sm:w-4 sm:h-4" />
                                <span>{profile.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Calendar size={14} className="sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Joined </span>
                                <span>{new Date(profile.joinDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Completion Progress */}
            {profileCompletion.percentage < 100 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                        <span className="text-sm font-semibold text-gray-900">{profileCompletion.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${profileCompletion.percentage}%` }}
                        ></div>
                    </div>
                    
                    {/* Completion Tasks */}
                    <div className="space-y-2">
                        <p className="text-xs text-gray-600 mb-2">Complete these to reach 100%:</p>
                        {profileCompletion.items.map((item, index) => (
                            !item.completed && (
                                <div key={index} className="flex items-center justify-between text-xs">
                                    <span className="text-gray-700">• {item.name}</span>
                                    {/* <span className="text-gray-500">{item.weight}%</span> */}
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-600">Active Schemes</p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-indigo-600">{profile.stats.totalSchemes}</p>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Settings className="text-indigo-600" size={16} />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-600">Active Aims</p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">{profile.stats.activeAims}</p>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Award className="text-yellow-600" size={16} />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-600">Completed Aims</p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{profile.stats.completedAims}</p>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Award className="text-green-600" size={16} />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-600">Days Active</p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{profile.stats.membershipDays}</p>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Calendar className="text-blue-600" size={16} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Personal Information Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center space-x-2">
                        <User size={18} className="sm:w-5 sm:h-5" />
                        <span>Personal & Contact Information</span>
                    </h3>
                    {!showProfileEdit && (
                        <button
                            onClick={handleEditProfile}
                            className="bg-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm flex items-center space-x-2"
                        >
                            <Edit size={14} className="sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Edit</span>
                        </button>
                    )}
                </div>

                {!showProfileEdit ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <p className="text-sm text-gray-900">{profile.first_name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <p className="text-sm text-gray-900">{profile.last_name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                <p className="text-sm text-gray-900">
                                    {new Date(profile.dateOfBirth).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <p className="text-sm text-gray-900 capitalize">{profile.gender}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Mail className="text-gray-600" size={16} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-700">Email Address</p>
                                    <p className="text-sm text-gray-900 truncate">{profile.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Phone className="text-gray-600" size={16} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-700">Mobile Number</p>
                                    <p className="text-sm text-gray-900">{profile.phone}</p>
                                </div>
                            </div>
                        </div>
                        {profile.website && (
                            <div className="md:col-span-2 border-t pt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                <a
                                    href={profile.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-indigo-600 hover:text-indigo-800 break-all"
                                >
                                    {profile.website}
                                </a>
                            </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmitProfile} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={profileFormData.first_name}
                                    onChange={handleProfileInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                    placeholder="First Name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={profileFormData.last_name}
                                    onChange={handleProfileInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                    placeholder="Last Name"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={profileFormData.email}
                                onChange={handleProfileInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                placeholder="Email Address"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                            <input
                                type="tel"
                                name="mobile_no"
                                value={profileFormData.mobile_no}
                                onChange={handleProfileInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                placeholder="Mobile Number"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={profileFormData.date_of_birth}
                                    onChange={handleProfileInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                <select
                                    name="gender"
                                    value={profileFormData.gender}
                                    onChange={handleProfileInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                            <button
                                type="submit"
                                className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium text-sm flex items-center justify-center space-x-2"
                            >
                                <Save size={14} />
                                <span>Save Changes</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelProfile}
                                className="w-full sm:w-auto bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium text-sm flex items-center justify-center space-x-2"
                            >
                                <X size={14} />
                                <span>Cancel</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Address Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center space-x-2">
                        <MapPin size={18} className="sm:w-5 sm:h-5" />
                        <span>Address</span>
                    </h3>
                    {!showAddressForm && (
                        address ? (
                            <button
                                onClick={handleEditAddress}
                                className="bg-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm flex items-center space-x-2 self-start sm:self-auto"
                            >
                                <Edit size={14} className="sm:w-4 sm:h-4" />
                                <span>Edit Address</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleAddAddress}
                                className="bg-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm flex items-center space-x-2 self-start sm:self-auto"
                            >
                                <Plus size={14} className="sm:w-4 sm:h-4" />
                                <span>Add Address</span>
                            </button>
                        )
                    )}
                </div>

                {!showAddressForm ? (
                    address ? (
                        <div className="p-3 sm:p-4 border-2 rounded-lg border-indigo-200 bg-indigo-50">
                            {/* <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h4 className="font-semibold text-gray-900">Home Address</h4>
                                    <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full mt-1">
                                        Primary
                                    </span>
                                </div>
                            </div> */}
                            <div className="text-sm text-gray-700 space-y-1">
                                <p>{address.street}</p>
                                <p>{address.city}, {address.district}, {address.state}, {address.country}</p>
                                <p>PIN: {address.postal_code}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 sm:py-8">
                            <MapPin size={40} className="sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                            <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No address saved</h4>
                            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Add your first address to make checkout faster</p>
                            <button
                                onClick={handleAddAddress}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm flex items-center space-x-2 mx-auto"
                            >
                                <Plus size={16} />
                                <span>Add Address</span>
                            </button>
                        </div>
                    )
                ) : (
                    <form onSubmit={handleSubmitAddress} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                            <input
                                type="text"
                                name="street"
                                value={formData.street}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                placeholder="Enter street address"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                    placeholder="City"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                                <input
                                    type="text"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                    placeholder="District"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                    placeholder="State"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                    placeholder="Country"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                            <input
                                type="text"
                                name="postal_code"
                                value={formData.postal_code}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                placeholder="Postal Code"
                                required
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                            <button
                                type="submit"
                                className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium text-sm"
                            >
                                {isEditMode ? 'Update Address' : 'Add Address'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="w-full sm:w-auto bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>


        </div>
    );
};

export default GetProfile;