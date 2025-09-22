import React, { useState } from 'react';
import { ArrowLeft, MapPin, Save, Home, Building, Plus } from 'lucide-react';

const AddAddress = ({ onBack }) => {
  const [addressData, setAddressData] = useState({
    type: 'home',
    label: '',
    street: '',
    street2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    isPrimary: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const addressTypes = [
    { value: 'home', label: 'Home', icon: Home },
    { value: 'work', label: 'Work', icon: Building },
    { value: 'other', label: 'Other', icon: MapPin }
  ];

  const countries = [
    { value: 'USA', label: 'United States' },
    { value: 'CAN', label: 'Canada' },
    { value: 'GBR', label: 'United Kingdom' },
    { value: 'AUS', label: 'Australia' },
    { value: 'DEU', label: 'Germany' },
    { value: 'FRA', label: 'France' },
    { value: 'JPN', label: 'Japan' },
    { value: 'IND', label: 'India' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setAddressData({ ...addressData, [name]: newValue });
    
    // Auto-generate label if not manually set
    if (name === 'type' && !addressData.label) {
      const selectedType = addressTypes.find(t => t.value === value);
      setAddressData(prev => ({ 
        ...prev, 
        [name]: newValue,
        label: `${selectedType.label} Address`
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!addressData.label.trim()) {
      newErrors.label = 'Address label is required';
    }

    if (!addressData.street.trim()) {
      newErrors.street = 'Street address is required';
    }

    if (!addressData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!addressData.state.trim()) {
      newErrors.state = 'State/Province is required';
    }

    if (!addressData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP/Postal code is required';
    }

    if (!addressData.country) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would normally save to your backend
      console.log('New address:', addressData);
      
      alert('Address added successfully!');
      onBack();
    } catch (error) {
      console.error('Error adding address:', error);
      setErrors({ general: 'Failed to add address. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={onBack}
            className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-2 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Profile</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="text-indigo-600" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Add New Address</h2>
          <p className="text-gray-600">Add a new address to your profile for faster checkout</p>
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Address Type *
            </label>
            <div className="grid grid-cols-3 gap-4">
              {addressTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <label
                    key={type.value}
                    className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      addressData.type === type.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={addressData.type === type.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <IconComponent 
                      size={24} 
                      className={addressData.type === type.value ? 'text-indigo-600' : 'text-gray-400'}
                    />
                    <span className={`mt-2 text-sm font-medium ${
                      addressData.type === type.value ? 'text-indigo-600' : 'text-gray-700'
                    }`}>
                      {type.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Address Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Label *
            </label>
            <input
              type="text"
              name="label"
              value={addressData.label}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${
                errors.label ? 'border-red-300' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
              placeholder="e.g., Home Address, Office, Mom's House"
            />
            {errors.label && (
              <p className="mt-1 text-sm text-red-600">{errors.label}</p>
            )}
          </div>

          {/* Street Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              name="street"
              value={addressData.street}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${
                errors.street ? 'border-red-300' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
              placeholder="123 Main Street"
            />
            {errors.street && (
              <p className="mt-1 text-sm text-red-600">{errors.street}</p>
            )}
          </div>

          {/* Street Address 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address 2 (Optional)
            </label>
            <input
              type="text"
              name="street2"
              value={addressData.street2}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Apartment, suite, unit, building, floor, etc."
            />
          </div>

          {/* City, State, ZIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={addressData.city}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  errors.city ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                placeholder="San Francisco"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province *
              </label>
              <input
                type="text"
                name="state"
                value={addressData.state}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  errors.state ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                placeholder="CA"
              />
              {errors.state && (
                <p className="mt-1 text-sm text-red-600">{errors.state}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP/Postal Code *
              </label>
              <input
                type="text"
                name="zipCode"
                value={addressData.zipCode}
                onChange={handleChange}
                className={`w-full px-4 py-3 border ${
                  errors.zipCode ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                placeholder="94102"
              />
              {errors.zipCode && (
                <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
              )}
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <select
              name="country"
              value={addressData.country}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${
                errors.country ? 'border-red-300' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
            >
              {countries.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country}</p>
            )}
          </div>

          {/* Primary Address Checkbox */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isPrimary"
              name="isPrimary"
              checked={addressData.isPrimary}
              onChange={handleChange}
              className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
            />
            <label htmlFor="isPrimary" className="text-sm font-medium text-gray-700">
              Set as primary address
            </label>
          </div>

          {/* Address Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Address Preview:</h4>
            <div className="text-sm text-gray-700">
              {addressData.label && <p className="font-medium">{addressData.label}</p>}
              {addressData.street && <p>{addressData.street}</p>}
              {addressData.street2 && <p>{addressData.street2}</p>}
              {(addressData.city || addressData.state || addressData.zipCode) && (
                <p>
                  {[addressData.city, addressData.state, addressData.zipCode]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
              {addressData.country && (
                <p>{countries.find(c => c.value === addressData.country)?.label}</p>
              )}
              {addressData.isPrimary && (
                <p className="text-indigo-600 font-medium text-xs mt-1">Primary Address</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center space-x-2 transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Adding Address...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Save Address</span>
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

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Address Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use clear, descriptive labels for easy identification</li>
            <li>• Double-check spelling for accurate delivery</li>
            <li>• Set your most frequently used address as primary</li>
            <li>• Include apartment/unit numbers in Street Address 2</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddAddress;