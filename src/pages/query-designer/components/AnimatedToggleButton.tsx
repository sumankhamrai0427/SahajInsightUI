import { ReactNode, useState } from 'react';
interface ToggleOption {
  label?: string;
  icon?: ReactNode;
  value: string | number;
}

interface AnimatedToggleButtonProps {
  options: ToggleOption[];
  defaultSelected?: number;
  onChange?: (selectedIndex: number, value: string | number) => void;
  width?: string;
  height?: string;
  buttonPadding?: string;
  gap?: string; 
  containerPadding?: string;
  backgroundColor?: string;
  activeBackgroundColor?: string;
  textColor?: string;
  activeTextColor?: string;
  hoverTextColor?: string;
  borderRadius?: string;
  activeBorderRadius?: string;
  shadow?: string;
  fontSize?: string;
  fontWeight?: string;
  transitionDuration?: string;
  transitionTiming?: string;
  iconPosition?: 'left' | 'right' | 'top' | 'bottom';
  iconSize?: string;
  iconGap?: string;
  mode?: 'icon' | 'text' | 'both';
}
export default function AnimatedToggleButton({ 
  options,
  defaultSelected = 0,
  onChange,
  width = 'auto',
  height = 'auto',
  buttonPadding = '0.5rem 1.5rem',
  gap = '0.25rem',
  containerPadding = '0.25rem',
  backgroundColor = '#FFFFFF',
  activeBackgroundColor = '#D9D9D9',
  textColor = '#6b7280',
  activeTextColor = '#111827',
  hoverTextColor = '#374151',
  borderRadius = '0.75rem',
  activeBorderRadius = '0.375rem',
  shadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  fontSize = '0.875rem',
  fontWeight = '500',
  transitionDuration = '300ms',
  transitionTiming = 'ease-out',
  iconPosition = 'left',
  iconSize = '1.25rem',
  iconGap = '0.5rem',
  mode = 'both'
}: AnimatedToggleButtonProps) {
  const [selected, setSelected] = useState(defaultSelected);
  const handleSelect = (index: number) => {
    setSelected(index);
    onChange?.(index, options[index].value);
  };
  const totalGapSpace = `calc(${options.length - 1} * ${gap})`;
  const buttonWidth = `calc((100% - ${totalGapSpace}) / ${options.length})`;
  const getFlexDirection = () => {
    if (iconPosition === 'top') return 'flex-col';
    if (iconPosition === 'bottom') return 'flex-col-reverse';
    if (iconPosition === 'right') return 'flex-row-reverse';
    return 'flex-row';
  };
  const shouldShowIcon = mode === 'icon' || mode === 'both';
  const shouldShowText = mode === 'text' || mode === 'both';
  return (
    <div 
      className="relative grid items-center" 
      style={{
        backgroundColor,
        borderRadius,
        padding: containerPadding,
        width,
        height,
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        gap: gap,
      }}
    >
      <div
        className="h-full"
        style={{
          gridColumn: `${selected + 1}`,
          gridRow: '1',
          backgroundColor: activeBackgroundColor,
          borderRadius: activeBorderRadius,
          boxShadow: shadow,
          transitionProperty: 'grid-column, background-color',
          transitionDuration,
          transitionTimingFunction: transitionTiming
        }}
      />
      {options.map((option, index) => (
        <button
          key={index}
          type="button"
          onClick={() => handleSelect(index)}
          className={`z-10 flex items-center justify-center transition-colors h-full w-full ${getFlexDirection()}`}
          style={{
            gridColumn: `${index + 1}`,
            gridRow: '1', 
            padding: buttonPadding,
            fontSize,
            fontWeight,
            borderRadius: activeBorderRadius,
            color: selected === index ? activeTextColor : textColor,
            transitionDuration,
            transitionTimingFunction: transitionTiming,
            gap: iconGap,
          }}
          onMouseEnter={(e) => {
            if (selected !== index) {
              e.currentTarget.style.color = hoverTextColor;
            }
          }}
          onMouseLeave={(e) => {
            if (selected !== index) {
              e.currentTarget.style.color = textColor;
            }
          }}
        >
          {shouldShowIcon && option.icon && (
            <span style={{ fontSize: iconSize, display: 'flex', alignItems: 'center' }}>
              {option.icon}
            </span>
          )}
          {shouldShowText && option.label && (
            <span className="whitespace-nowrap truncate">{option.label}</span>
          )}
        </button>
      ))}
    </div>
  );
}