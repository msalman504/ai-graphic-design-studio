import React from 'react';
import { CheckCircleIcon, XCircleIcon } from './icons';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const isSuccess = type === 'success';
  
  const baseClasses = "fixed bottom-5 right-5 flex items-center gap-4 p-4 rounded-xl shadow-lg z-50 border animate-fade-in-up w-auto max-w-sm";
  const successClasses = "bg-green-100 border-green-200 text-green-800";
  const errorClasses = "bg-red-100 border-red-200 text-red-800";

  const Icon = isSuccess ? CheckCircleIcon : XCircleIcon;
  const iconColor = isSuccess ? "text-green-500" : "text-red-500";


  return (
    <div className={`${baseClasses} ${isSuccess ? successClasses : errorClasses}`}>
      <Icon className={`w-6 h-6 flex-shrink-0 ${iconColor}`} />
      <p className="text-sm font-semibold">{message}</p>
    </div>
  );
};