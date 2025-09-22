import React, { useState } from 'react';
import SchemeList from '../components/scheme/SchemeList';
import SelectedSchemes from '../components/scheme/SelectedSchemeList';
import ViewSelectedScheme from '../components/scheme/ViewSelectedScheme';

const SchemesManager = () => {
  const [currentView, setCurrentView] = useState('selected'); // Default to SelectedSchemes
  const [selectedSchemeToView, setSelectedSchemeToView] = useState(null);

  // Handler to navigate to SchemeList
  const handleViewSchemeList = () => {
    setCurrentView('list');
    setSelectedSchemeToView(null);
  };

  // Handler to navigate back to SelectedSchemes
  const handleBackToSelectedSchemes = () => {
    setCurrentView('selected');
    setSelectedSchemeToView(null);
  };

  // Handler to view a specific scheme details
  const handleViewScheme = (scheme) => {
    console.log('Viewing scheme:', scheme);
    setSelectedSchemeToView(scheme);
    setCurrentView('view');
  };

  // Handler for when payment is made in ViewSelectedScheme
  const handleMakePayment = async (scheme) => {
    // Mock payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // After payment, you might want to refresh the selected schemes
    // This would typically involve updating the scheme data
    console.log('Payment made for scheme:', scheme);
    
    // For now, just resolve the promise
    return Promise.resolve();
  };

  // Render the appropriate component based on current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'list':
        return (
          <SchemeList
            onViewSelected={handleBackToSelectedSchemes}
          />
        );
      
      case 'view':
        return (
          <ViewSelectedScheme
            selectedScheme={selectedSchemeToView}
            onBack={handleBackToSelectedSchemes}
            onMakePayment={handleMakePayment}
          />
        );
      
      case 'selected':
      default:
        return (
          <SelectedSchemes
            onBack={handleViewSchemeList}
            onViewScheme={handleViewScheme}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderCurrentView()}
    </div>
  );
};

export default SchemesManager;