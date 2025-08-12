import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" 
        aria-hidden="true"
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-lg transform rounded-xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 transition-all animate-slide-in-up">
        <div className="px-6 pt-5 pb-6">
            <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100" id="modal-title">
              {title}
            </h3>
            <div className="mt-4">
              {children}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;