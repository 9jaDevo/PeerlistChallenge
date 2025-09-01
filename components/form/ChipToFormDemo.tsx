"use client";

import { useState, useCallback } from "react";
import { FadeIn, ScaleIn } from "../motion/Primitives";
import { ProgressiveInputStack, FormField } from "./ProgressiveInputStack";
import { useStore } from "../../lib/store";

// Sample form fields
const SAMPLE_FORM_FIELDS: FormField[] = [
  {
    id: 'name',
    type: 'text',
    label: 'Full Name',
    placeholder: 'Enter your full name',
    required: true,
    status: 'pending',
    icon: '👤',
    helpText: 'This will be displayed on your public profile',
    validation: (value) => value.length >= 2,
    errorMessage: 'Name must be at least 2 characters'
  },
  {
    id: 'email',
    type: 'email',
    label: 'Email Address',
    placeholder: 'your.email@example.com',
    required: true,
    status: 'pending',
    icon: '📧',
    helpText: 'We\'ll use this for important account notifications',
    validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    errorMessage: 'Please enter a valid email address'
  },
  {
    id: 'phone',
    type: 'phone',
    label: 'Phone Number',
    placeholder: '+1 (555) 000-0000',
    required: false,
    status: 'pending',
    icon: '📱',
    helpText: 'Optional - for account security and recovery',
    validation: (value) => !value || /^[\+]?[\d\s\-\(\)]{10,}$/.test(value),
    format: (value) => {
      // Simple phone formatting
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  },
  {
    id: 'role',
    type: 'select',
    label: 'Professional Role',
    placeholder: 'Select your role',
    required: true,
    status: 'pending',
    icon: '💼',
    helpText: 'This helps us customize your experience',
    options: [
      'Software Engineer',
      'Product Manager',
      'Designer',
      'Data Scientist',
      'Marketing',
      'Sales',
      'Other'
    ],
    validation: (value) => value.length > 0
  },
  {
    id: 'company',
    type: 'text',
    label: 'Company',
    placeholder: 'Your current company',
    required: false,
    status: 'pending',
    icon: '🏢',
    helpText: 'Where do you currently work?',
    validation: (value) => true // Optional field
  },
  {
    id: 'experience',
    type: 'select',
    label: 'Years of Experience',
    placeholder: 'Select experience level',
    required: true,
    status: 'pending',
    icon: '⭐',
    helpText: 'This helps us show relevant content',
    options: [
      '0-1 years',
      '2-3 years',
      '4-6 years',
      '7-10 years',
      '10+ years'
    ],
    validation: (value) => value.length > 0
  },
  {
    id: 'bio',
    type: 'textarea',
    label: 'Professional Bio',
    placeholder: 'Tell us about yourself and your interests...',
    required: false,
    status: 'pending',
    icon: '📝',
    helpText: 'Share what makes you unique (optional)',
    validation: (value) => true // Optional field
  },
  {
    id: 'website',
    type: 'text',
    label: 'Personal Website',
    placeholder: 'https://yoursite.com',
    required: false,
    status: 'pending',
    icon: '🌐',
    helpText: 'Your portfolio, blog, or LinkedIn profile',
    validation: (value) => !value || /^https?:\/\/.+\..+/.test(value),
    errorMessage: 'Please enter a valid URL (starting with http:// or https://)'
  }
];

interface ChipToFormDemoProps {
  className?: string;
}

export function ChipToFormDemo({ className = "" }: ChipToFormDemoProps) {
  const { preferences } = useStore();
  
  // Demo state
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Handle field updates
  const handleFieldUpdate = useCallback((fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  }, []);

  // Handle form completion
  const handleFormComplete = useCallback((data: Record<string, string>) => {
    setFormData(data);
    setIsFormComplete(true);
    setShowSuccessMessage(true);
    
    console.log('Form completed with data:', data);
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  }, []);

  // Reset form
  const handleReset = useCallback(() => {
    setFormData({});
    setIsFormComplete(false);
    setShowSuccessMessage(false);
    // Reset field statuses
    SAMPLE_FORM_FIELDS.forEach(field => {
      field.status = 'pending';
      field.value = undefined;
    });
  }, []);

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      <FadeIn className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-2 rounded-full text-sm font-medium mb-6">
          📝 Day 5
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">
          Progressive Input Stack
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Experience the "Chip-to-Form" pattern where compact chips expand into full input fields 
          with contextual help, then collapse back with success indicators.
        </p>
      </FadeIn>

      {/* Success Message */}
      {showSuccessMessage && (
        <ScaleIn className="mb-8">
          <div className="bg-ok/10 border border-ok/30 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-ok rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">✓</span>
            </div>
            <h2 className="text-xl font-bold text-ok mb-2">Profile Complete!</h2>
            <p className="text-gray-300 mb-4">
              All fields have been successfully saved with auto-save enabled.
            </p>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-brand hover:bg-brand/80 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </ScaleIn>
      )}

      {/* Progressive Input Stack */}
      <ScaleIn delay={0.2}>
        <ProgressiveInputStack
          fields={SAMPLE_FORM_FIELDS}
          onFieldUpdate={handleFieldUpdate}
          onFormComplete={handleFormComplete}
          autoSave={true}
        />
      </ScaleIn>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 mb-12">
        <ScaleIn delay={0.4} className="bg-surface/10 rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand/20 rounded-lg flex items-center justify-center">
              <span className="text-brand text-lg">🎯</span>
            </div>
            <div>
              <h3 className="text-white font-medium">Chip Expansion</h3>
              <p className="text-gray-400 text-sm">Smooth transitions</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm">
            Fields start as compact chips and smoothly expand into full input forms with contextual help.
          </p>
        </ScaleIn>

        <ScaleIn delay={0.5} className="bg-surface/10 rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-ok/20 rounded-lg flex items-center justify-center">
              <span className="text-ok text-lg">⚡</span>
            </div>
            <div>
              <h3 className="text-white font-medium">Auto-save & Progress</h3>
              <p className="text-gray-400 text-sm">Never lose your work</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm">
            Automatic saving with visual progress tracking and persistent side rail navigation.
          </p>
        </ScaleIn>

        <ScaleIn delay={0.6} className="bg-surface/10 rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center">
              <span className="text-warning text-lg">⌨️</span>
            </div>
            <div>
              <h3 className="text-white font-medium">Keyboard First</h3>
              <p className="text-gray-400 text-sm">Optimized for efficiency</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm">
            Tab navigation, Enter to save, Escape to cancel - designed for keyboard power users.
          </p>
        </ScaleIn>
      </div>

      {/* Form Data Preview */}
      {Object.keys(formData).length > 0 && (
        <ScaleIn delay={0.8} className="bg-surface/10 rounded-xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Form Data Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(formData).map(([key, value]) => {
              const field = SAMPLE_FORM_FIELDS.find(f => f.id === key);
              return (
                <div key={key} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="text-lg">{field?.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm">{field?.label}</div>
                    <div className="text-gray-400 text-sm truncate">{value || 'Not provided'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScaleIn>
      )}

      {/* Instructions */}
      <ScaleIn delay={1.0} className="text-center mt-12">
        <div className="bg-brand/5 border border-brand/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">How to Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              • <strong className="text-white">Click chips</strong> to expand into full input fields
            </div>
            <div>
              • <strong className="text-white">Tab navigation</strong> moves between fields automatically
            </div>
            <div>
              • <strong className="text-white">Enter to save</strong> and collapse back to chip with checkmark
            </div>
            <div>
              • <strong className="text-white">Auto-save enabled</strong> - progress is never lost
            </div>
          </div>
        </div>
      </ScaleIn>
    </div>
  );
}