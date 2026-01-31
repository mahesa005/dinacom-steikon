'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  headerClassName?: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  size = 'md',
  title,
  subtitle,
  showHeader = true,
  headerClassName = '',
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl',
    full: 'max-w-6xl',
  };

  const modalContent = (
    <div className="fixed inset-0 z-50">
      <div
        ref={overlayRef}
        className="modal-backdrop absolute inset-0"
        onClick={(e) => e.target === overlayRef.current && onClose()}
      />
      <div className="absolute inset-0 overflow-y-auto p-4 sm:p-6 md:p-20">
        <div className="flex min-h-full items-center justify-center">
          <div
            className={`animate-slide-in relative w-full ${sizeClasses[size]} bg-white rounded-xl shadow-2xl`}
          >
            {showHeader && (title || subtitle) && (
              <div
                className={`px-6 py-4 border-b border-gray-200 flex items-center justify-between ${headerClassName}`}
              >
                <div>
                  {title && (
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                  )}
                  {subtitle && (
                    <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
