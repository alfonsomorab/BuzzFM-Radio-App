import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ className, label, error, helpText, id, ...props }, ref) => {
    const inputId = id || `field-${Math.random().toString(36).substring(7)}`;

    return (
      <div className="mb-3">
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
            {props.required && <span className="text-danger ms-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn("form-control", error && "is-invalid", className)}
          {...props}
        />
        {error && <div className="invalid-feedback">{error}</div>}
        {helpText && !error && <div className="form-text">{helpText}</div>}
      </div>
    );
  }
);

FormField.displayName = "FormField";

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ className, label, error, helpText, id, ...props }, ref) => {
    const inputId = id || `field-${Math.random().toString(36).substring(7)}`;

    return (
      <div className="mb-3">
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
            {props.required && <span className="text-danger ms-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn("form-control", error && "is-invalid", className)}
          {...props}
        />
        {error && <div className="invalid-feedback">{error}</div>}
        {helpText && !error && <div className="form-text">{helpText}</div>}
      </div>
    );
  }
);

TextAreaField.displayName = "TextAreaField";
