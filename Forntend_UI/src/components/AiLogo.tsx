import React from 'react';
import { Shield } from 'lucide-react';

export default function AiLogo() {
  return (
    <div className="relative inline-block">
      <div className="ai-face text-blue-600">
        <div className="ai-eyes">
          <div className="ai-eye"></div>
          <div className="ai-eye" style={{ animationDelay: '0.1s' }}></div>
        </div>
      </div>
      <div className="ai-shield">
        <Shield className="h-6 w-6 text-blue-500" />
      </div>
    </div>
  );
}