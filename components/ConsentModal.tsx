


import React from 'react';
import { ConsentRequest } from '../types';
import Button from './ui/Button';
import { ToolIcon } from '../constants';

const ConsentModal: React.FC<{
  request: ConsentRequest;
  onResponse: (granted: boolean) => void;
}> = ({ request, onResponse }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onResponse(false)}
      ></div>
      <div className="relative w-full max-w-md transform rounded-xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 transition-all animate-slide-in-up">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/50 sm:mx-0 sm:h-10 sm:w-10">
              <AlertTriangleIcon className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
            </div>
            <div className="mt-0 text-left">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100" id="modal-title">
                Permission Request
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: request.prompt.replace(/`([^`]+)`/g, '<strong>$1</strong>') }} />
              </div>
            </div>
          </div>
          
          <div className="mt-4 rounded-lg bg-gray-100 dark:bg-gray-900/50 p-3 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold flex items-center gap-2"><ToolIcon/> Tool Details</h4>
            <pre className="mt-2 text-xs font-mono text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded overflow-x-auto">
              {JSON.stringify(request.args, null, 2)}
            </pre>
          </div>

        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 rounded-b-xl">
          <Button
            variant="primary"
            onClick={() => onResponse(true)}
            className="w-full sm:ml-3 sm:w-auto !bg-yellow-500 hover:!bg-yellow-600 focus:!ring-yellow-500"
          >
            Allow
          </Button>
          <Button
            variant="secondary"
            onClick={() => onResponse(false)}
            className="mt-3 w-full sm:mt-0 sm:w-auto"
          >
            Deny
          </Button>
        </div>
      </div>
    </div>
  );
};

// AlertTriangleIcon is defined locally, so it does not need to be imported.
const AlertTriangleIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);

export default ConsentModal;