// Select compatible con API nativa (<option /> + onChange) sobre base-ui.
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { ChevronDownIcon, CheckIcon } from "lucide-react";
import {
  Children,
  ForwardedRef,
  ReactElement,
  SelectHTMLAttributes,
  forwardRef,
  useMemo
} from "react";
import { cn } from "../../lib/utils";

type NativeSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  children?: React.ReactNode;
};

type OptionLike = ReactElement<{ value?: string; children?: React.ReactNode; disabled?: boolean }>;

function isOptionElement(node: unknown): node is OptionLike {
  if (!node || typeof node !== "object") return false;
  const element = node as { type?: unknown; props?: { value?: string } };
  return element.type === "option" || (typeof element.props?.value === "string");
}

function SelectImpl(
  { className, value, defaultValue, onChange, children, disabled, name, id, "aria-labelledby": ariaLabelledby, "aria-describedby": ariaDescribedby }: NativeSelectProps,
  _ref: ForwardedRef<HTMLSelectElement>
) {
  const options = useMemo(
    () =>
      Children.toArray(children)
        .filter(isOptionElement)
        .map((child) => ({
          value: String(child.props.value ?? ""),
          label: child.props.children,
          disabled: child.props.disabled ?? false
        })),
    [children]
  );

  const selectedValue =
    typeof value === "string" ? value : typeof defaultValue === "string" ? defaultValue : options[0]?.value ?? "";
  const selectedOption = options.find((option) => option.value === selectedValue);

  return (
    <SelectPrimitive.Root
      value={selectedValue}
      disabled={disabled}
      onValueChange={(nextValue) => {
        if (!onChange) return;
        onChange({
          target: { value: nextValue, name },
          currentTarget: { value: nextValue, name }
        } as unknown as React.ChangeEvent<HTMLSelectElement>);
      }}
    >
      <SelectPrimitive.Trigger
        id={id}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm text-slate-900 shadow-sm ring-1 ring-transparent transition focus-visible:border-[#8e633d] focus-visible:outline-none focus-visible:ring-[#8e633d]/40 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus-visible:border-[#8e633d] dark:focus-visible:ring-[#8e633d]/40",
          className
        )}
      >
        <span>{selectedOption?.label ?? selectedValue}</span>
        <SelectPrimitive.Icon render={<ChevronDownIcon className="h-4 w-4 opacity-80" />} />
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner sideOffset={4} className="z-[220]">
          <SelectPrimitive.Popup className="z-[220] min-w-[var(--anchor-width)] overflow-hidden rounded-xl border border-[#8e633d] bg-[#f8f1e5] p-1 shadow-lg dark:border-[#8e633d] dark:bg-[#f8f1e5]">
            <SelectPrimitive.List>
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className="relative flex cursor-default items-center rounded-lg px-3 py-2 text-sm text-[#4d311d] outline-none select-none focus:bg-[#ead9bd] dark:text-[#4d311d] dark:focus:bg-[#ead9bd] data-[disabled]:pointer-events-none data-[disabled]:opacity-40"
                >
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator
                    render={<span className="ml-auto inline-flex h-4 w-4 items-center justify-center" />}
                  >
                    <CheckIcon className="h-4 w-4 text-[#8e633d]" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export const Select = forwardRef<HTMLSelectElement, NativeSelectProps>(SelectImpl);
Select.displayName = "Select";
