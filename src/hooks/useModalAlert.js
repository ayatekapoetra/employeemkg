import { useState, useCallback } from 'react';

export const useModalAlert = () => {
  const [alertState, setAlertState] = useState({
    isVisible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: [],
    showCloseButton: true,
  });

  const showAlert = useCallback((config) => {
    setAlertState({
      isVisible: true,
      title: config.title || '',
      message: config.message || '',
      type: config.type || 'info',
      buttons: config.buttons || [],
      showCloseButton: config.showCloseButton !== false,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isVisible: false }));
  }, []);

  const showSuccessAlert = useCallback((title, message, buttons = []) => {
    showAlert({ title, message, type: 'success', buttons });
  }, [showAlert]);

  const showErrorAlert = useCallback((title, message, buttons = []) => {
    showAlert({ title, message, type: 'error', buttons });
  }, [showAlert]);

  const showWarningAlert = useCallback((title, message, buttons = []) => {
    showAlert({ title, message, type: 'warning', buttons });
  }, [showAlert]);

  const showInfoAlert = useCallback((title, message, buttons = []) => {
    showAlert({ title, message, type: 'info', buttons });
  }, [showAlert]);

  const showConfirmAlert = useCallback((title, message, onConfirm, onCancel) => {
    const buttons = [
      {
        text: 'Batal',
        type: 'cancel',
        onPress: onCancel || hideAlert,
      },
      {
        text: 'Ya',
        type: 'primary',
        onPress: onConfirm,
      },
    ];
    showAlert({ title, message, type: 'warning', buttons, showCloseButton: false });
  }, [hideAlert, showAlert]);

  const showDeleteAlert = useCallback((title = 'Hapus Data', message = 'Apakah Anda yakin ingin menghapus data ini?', onDelete, onCancel) => {
    const buttons = [
      {
        text: 'Batal',
        type: 'cancel',
        onPress: onCancel || hideAlert,
      },
      {
        text: 'Hapus',
        type: 'destructive',
        onPress: onDelete,
      },
    ];
    showAlert({ title, message, type: 'error', buttons, showCloseButton: false });
  }, [hideAlert, showAlert]);

  return {
    alertState,
    showAlert,
    hideAlert,
    showSuccessAlert,
    showErrorAlert,
    showWarningAlert,
    showInfoAlert,
    showConfirmAlert,
    showDeleteAlert,
  };
};