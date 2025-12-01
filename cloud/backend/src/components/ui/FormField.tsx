import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BaseFormFieldProps {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  id?: string;
}

interface InputFormFieldProps extends InputHTMLAttributes<HTMLInputElement>, BaseFormFieldProps {
  as?: "input";
}

interface TextareaFormFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseFormFieldProps {
  as: "textarea";
}

interface SelectFormFieldProps extends SelectHTMLAttributes<HTMLSelectElement>, BaseFormFieldProps {
  as: "select";
  children?: ReactNode;
}

type FormFieldProps = InputFormFieldProps | TextareaFormFieldProps | SelectFormFieldProps;

export const FormField = forwardRef<any, FormFieldProps>(
  ({ className, label, error, helpText, id, as = "input", ...props }, ref) => {
    const inputId = id || `field-${Math.random().toString(36).substring(7)}`;
    const Element = as;

    return (
      <div className="mb-3">
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
            {props.required && <span className="text-danger ms-1">*</span>}
          </label>
        )}
        <Element
          ref={ref}
          id={inputId}
          className={cn(
            as === "select" ? "form-select" : "form-control",
            error && "is-invalid",
            className
          )}
          {...(props as any)}
        />
        {error && <div className="invalid-feedback d-block">{error}</div>}
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
