import React, { useState } from 'react';
import { Plus, Target, Calendar, Flag } from 'lucide-react';

const AddAim = ({ onAimAdded }) => {
  const [aimData, setAimData] = useState({
    title: '',
    description: '',
    targetDate: '',
    priority: 'medium',
    category: 'personal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAimData({ ...aimData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!aimData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!aimData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (aimData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!aimData.targetDate) {
      newErrors.targetDate = 'Target date is required';
    } else if (new Date(aimData.targetDate) <= new Date()) {
      newErrors.targetDate = 'Target date must be in the future';
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAim = {
        ...aimData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      
      onAimAdded(newAim);
      
      // Reset form
      setAimData({
        title: '',
        description: '',
        targetDate: '',
        priority: 'medium',
        category: 'personal'
      });
    } catch (error) {
      console.error('Error adding aim:', error);
      setErrors({ general: 'Failed to add aim. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low Priority', color: 'text-green-600' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600' },
    { value: 'high', label: 'High Priority', color: 'text-red-600' }
  ];

  const categoryOptions = [
    { value: 'personal', label: 'Personal' },
    { value: 'career', label: 'Career' },
    { value: 'health', label: 'Health & Fitness' },
    { value: 'education', label: 'Education' },
    { value: 'financial', label: 'Financial' },
    { value: 'relationship', label: 'Relationships' },
    { value: 'hobby', label: 'Hobbies' }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="text-indigo-600" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Add New Aim</h2>
          <p className="text-gray-600">Set a new goal and track your progress towards achieving it</p>
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aim Title *
            </label>
            <input
              type="text"
              name="title"
              value={aimData.title}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
              placeholder="e.g., Learn a new programming language"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              rows={4}
              value={aimData.description}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none`}
              placeholder="Describe your aim in detail. What do you want to achieve and why is it important to you?"
            />
            <div className="flex justify-between mt-1">
              {errors.description ? (
                <p className="text-sm text-red-600">{errors.description}</p>
              ) : (
                <p className="text-sm text-gray-500">
                  {aimData.description.length}/500 characters
                </p>
              )}
            </div>
          </div>

          {/* Target Date and Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Target Date *
              </label>
              <input
                type="date"
                name="targetDate"
                value={aimData.targetDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border ${
                  errors.targetDate ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
              />
              {errors.targetDate && (
                <p className="mt-1 text-sm text-red-600">{errors.targetDate}</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Flag size={16} className="inline mr-1" />
                Priority Level
              </label>
              <select
                name="priority"
                value={aimData.priority}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={aimData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Preview */}
          {aimData.title && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Preview:</h4>
              <div className="space-y-1">
                <p className="font-medium text-gray-900">{aimData.title}</p>
                {aimData.description && (
                  <p className="text-sm text-gray-600">{aimData.description}</p>
                )}
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  {aimData.targetDate && (
                    <span>Due: {new Date(aimData.targetDate).toLocaleDateString()}</span>
                  )}
                  <span className="capitalize">{aimData.priority} Priority</span>
                  <span className="capitalize">{aimData.category}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
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
              onClick={() => {
                setAimData({
                  title: '',
                  description: '',
                  targetDate: '',
                  priority: 'medium',
                  category: 'personal'
                });
                setErrors({});
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors duration-200"
            >
              Clear Form
            </button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips for Setting Effective Aims:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Make your aims specific and measurable</li>
            <li>• Set realistic but challenging deadlines</li>
            <li>• Break large aims into smaller milestones</li>
            <li>• Review and update your aims regularly</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddAim;