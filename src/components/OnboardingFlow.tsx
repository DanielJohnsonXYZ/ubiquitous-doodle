'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Users, Mail, Target, Sparkles } from 'lucide-react';

interface OnboardingData {
  businessType: string;
  clientCount: string;
  primaryGoal: string;
  firstClient: {
    name: string;
    company: string;
    email: string;
  };
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}

const steps = [
  { id: 'welcome', title: 'Welcome', icon: Sparkles },
  { id: 'business', title: 'Your Business', icon: Users },
  { id: 'goals', title: 'Goals', icon: Target },
  { id: 'client', title: 'First Client', icon: Mail },
];

export default function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    businessType: '',
    clientCount: '',
    primaryGoal: '',
    firstClient: { name: '', company: '', email: '' },
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return data.businessType !== '' && data.clientCount !== '';
      case 2:
        return data.primaryGoal !== '';
      case 3:
        return data.firstClient.name.trim() !== '';
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-3 py-4 border-b border-gray-100">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                  index === currentStep
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : index < currentStep
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {index < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <StepIcon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 0 && (
            <div className="text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Relationship Intelligence
              </h2>
              <p className="text-gray-600 mb-6">
                Let&apos;s set up your account to help you monitor and strengthen your client relationships.
              </p>
              <p className="text-sm text-gray-500">
                This quick setup takes less than 2 minutes.
              </p>
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Tell us about your business</h2>
              <p className="text-gray-600 mb-6">This helps us tailor insights for your needs.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What type of work do you do?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Consulting', 'Agency', 'Freelance', 'SaaS'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setData({ ...data, businessType: type })}
                        className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                          data.businessType === type
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How many clients do you have?
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['1-5', '6-20', '20+'].map((count) => (
                      <button
                        key={count}
                        onClick={() => setData({ ...data, clientCount: count })}
                        className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                          data.clientCount === count
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">What&apos;s your primary goal?</h2>
              <p className="text-gray-600 mb-6">We&apos;ll prioritize insights based on your focus.</p>

              <div className="space-y-3">
                {[
                  { id: 'retention', label: 'Prevent churn & retain clients', desc: 'Get early warnings about at-risk relationships' },
                  { id: 'growth', label: 'Grow existing accounts', desc: 'Identify upsell and expansion opportunities' },
                  { id: 'efficiency', label: 'Save time on client management', desc: 'Automated summaries and follow-up reminders' },
                  { id: 'relationships', label: 'Strengthen relationships', desc: 'Deeper insights into client sentiment and needs' },
                ].map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setData({ ...data, primaryGoal: goal.id })}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                      data.primaryGoal === goal.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className={`font-medium ${data.primaryGoal === goal.id ? 'text-blue-700' : 'text-gray-900'}`}>
                      {goal.label}
                    </p>
                    <p className="text-sm text-gray-500">{goal.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Add your first client</h2>
              <p className="text-gray-600 mb-6">We&apos;ll use this to start matching your communications.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={data.firstClient.name}
                    onChange={(e) =>
                      setData({
                        ...data,
                        firstClient: { ...data.firstClient, name: e.target.value },
                      })
                    }
                    placeholder="e.g., Sarah Johnson"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={data.firstClient.company}
                    onChange={(e) =>
                      setData({
                        ...data,
                        firstClient: { ...data.firstClient, company: e.target.value },
                      })
                    }
                    placeholder="e.g., Acme Corp"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (for matching messages)
                  </label>
                  <input
                    type="email"
                    value={data.firstClient.email}
                    onChange={(e) =>
                      setData({
                        ...data,
                        firstClient: { ...data.firstClient, email: e.target.value },
                      })
                    }
                    placeholder="e.g., sarah@acme.com"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50">
          <div>
            {currentStep === 0 ? (
              <button
                onClick={onSkip}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Skip setup
              </button>
            ) : (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
