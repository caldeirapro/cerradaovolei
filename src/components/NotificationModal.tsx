'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, Info, HelpCircle, X } from 'lucide-react';

export interface ToastConfig {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface ConfirmModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface NotificationModalProps {
  toast: ToastConfig | null;
  onCloseToast: () => void;
  confirmModal: ConfirmModalConfig | null;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  toast,
  onCloseToast,
  confirmModal,
}) => {
  return (
    <>
      {/* Toast Alert Popup */}
      {toast && (
        <div className="fixed top-5 right-5 left-5 sm:left-auto sm:max-w-md z-50 animate-item-add">
          <div
            className={`rounded-2xl p-4 shadow-2xl border flex items-start gap-3 transition-all ${
              toast.type === 'warning' || toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-orange-50 border-orange-200 text-orange-900'
            }`}
          >
            {toast.type === 'warning' || toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            ) : toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm leading-tight">{toast.title}</h4>
              <p className="text-xs font-medium opacity-90 mt-1">{toast.message}</p>
            </div>

            <button
              onClick={onCloseToast}
              className="p-1 rounded-lg hover:bg-black/5 text-current opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-item-add">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-extrabold text-slate-800 mb-2">
              {confirmModal.title}
            </h3>
            <p className="text-sm text-slate-600 mb-6 font-medium leading-relaxed">
              {confirmModal.message}
            </p>

            <div className="flex gap-3">
              <button
                onClick={confirmModal.onCancel}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-200 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
