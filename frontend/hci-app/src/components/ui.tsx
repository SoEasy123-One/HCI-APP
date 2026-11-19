import { useId } from "react";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { Icon, type IconName } from "@/components/Icon";
import { cn, initials } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: IconName;
  iconRight?: IconName;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700 focus-visible:outline-brand-600",
  secondary:
    "border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-slate-400",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-slate-400",
  danger:
    "bg-rose-600 text-white shadow-sm shadow-rose-600/20 hover:bg-rose-700 focus-visible:outline-rose-600",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 px-3 text-xs",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-11 gap-2 px-5 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <Spinner className="size-4" />
      ) : icon ? (
        <Icon name={icon} size={size === "sm" ? 15 : 17} />
      ) : null}
      {children}
      {iconRight && !loading ? <Icon name={iconRight} size={size === "sm" ? 15 : 17} /> : null}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  label: string;
  tone?: "default" | "danger";
}

export function IconButton({ icon, label, tone = "default", className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
        tone === "danger"
          ? "text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-rose-500"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-slate-400",
        className,
      )}
      {...props}
    >
      <Icon name={icon} size={18} />
    </button>
  );
}

interface FieldShellProps {
  label?: string;
  error?: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}

function FieldShell({ label, error, hint, htmlFor, children }: FieldShellProps) {
  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-700">
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs font-medium text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

const controlBase =
  "w-full rounded-xl border bg-white text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50";

const controlTone = {
  normal: "border-slate-200 focus:border-brand-500 focus:ring-brand-500/15",
  error: "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15",
};

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: IconName;
  trailing?: ReactNode;
}

export function Input({
  label,
  error,
  hint,
  icon,
  trailing,
  className,
  id,
  name,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? name ?? generatedId;

  return (
    <FieldShell label={label} error={error} hint={hint} htmlFor={inputId}>
      <div className="relative">
        {icon ? (
          <Icon
            name={icon}
            size={18}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
          />
        ) : null}
        <input
          id={inputId}
          name={name}
          className={cn(
            controlBase,
            "h-11 px-3.5",
            icon && "pl-10",
            trailing && "pr-11",
            error ? controlTone.error : controlTone.normal,
            className,
          )}
          {...props}
        />
        {trailing ? (
          <div className="absolute top-1/2 right-1.5 -translate-y-1/2">{trailing}</div>
        ) : null}
      </div>
    </FieldShell>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className, id, name, ...props }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? name ?? generatedId;

  return (
    <FieldShell label={label} error={error} hint={hint} htmlFor={textareaId}>
      <textarea
        id={textareaId}
        name={name}
        className={cn(
          controlBase,
          "min-h-28 resize-y px-3.5 py-3",
          error ? controlTone.error : controlTone.normal,
          className,
        )}
        {...props}
      />
    </FieldShell>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Select({ label, error, hint, className, id, name, children, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? name ?? generatedId;

  return (
    <FieldShell label={label} error={error} hint={hint} htmlFor={selectId}>
      <div className="relative">
        <select
          id={selectId}
          name={name}
          className={cn(
            controlBase,
            "h-11 appearance-none px-3.5 pr-10",
            error ? controlTone.error : controlTone.normal,
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <Icon
          name="chevron-down"
          size={17}
          className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-slate-400"
        />
      </div>
    </FieldShell>
  );
}

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-slate-200/80 bg-white shadow-card", className)}
      {...props}
    >
      {children}
    </div>
  );
}

type BadgeTone = "brand" | "emerald" | "amber" | "rose" | "slate" | "violet" | "sky";

const badgeTones: Record<BadgeTone, string> = {
  brand: "bg-brand-50 text-brand-700 ring-brand-600/10",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/10",
  rose: "bg-rose-50 text-rose-700 ring-rose-600/10",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/10",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/10",
  sky: "bg-sky-50 text-sky-700 ring-sky-600/10",
};

interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone = "slate", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
    />
  );
}

export function FullPageLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <span className="inline-block size-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
        <p className="text-sm font-medium">Loading your workspace…</p>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon = "sparkles",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-12 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm ring-1 ring-slate-200">
        <Icon name={icon} size={22} />
      </span>
      <h3 className="mt-4 text-sm font-bold text-slate-800">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-bold tracking-[0.14em] text-brand-600 uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {subtitle ? <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-xs font-bold text-white shadow-sm",
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
