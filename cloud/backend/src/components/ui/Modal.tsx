"use client";

import { ReactNode, useEffect, useRef } from "react";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  children: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "danger" | "success" | "warning";
  loading?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  loading = false,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const modalElement = modalRef.current;
    if (!modalElement) return;

    // Import Bootstrap Modal dynamically
    // @ts-ignore - Bootstrap JS doesn't have TypeScript definitions
    import("bootstrap/dist/js/bootstrap.bundle.min.js").then((bootstrap) => {
      const Modal = bootstrap.default.Modal;
      const bsModal = Modal.getOrCreateInstance(modalElement);

      if (isOpen) {
        bsModal.show();
      } else {
        bsModal.hide();
      }
    });
  }, [isOpen]);

  return (
    <div
      ref={modalRef}
      className="modal fade"
      tabIndex={-1}
      aria-labelledby="modalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="modalLabel">
              {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">{children}</div>
          <div className="modal-footer">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              {cancelText}
            </Button>
            {onConfirm && (
              <Button
                variant={confirmVariant}
                onClick={onConfirm}
                loading={loading}
                disabled={loading}
              >
                {confirmText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
