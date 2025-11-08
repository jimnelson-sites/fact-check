
import React from 'react';
import { ExclamationTriangleIcon } from './icons/Icons';


interface ErrorAlertProps {
  message: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => (
  <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative flex items-start" role="alert">
    <ExclamationTriangleIcon className="h-5 w-5 mr-3 mt-0.5 text-red-400" />
    <div>
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  </div>
);
