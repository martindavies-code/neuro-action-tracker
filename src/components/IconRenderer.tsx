import React from 'react';
import { getIconComponent } from '../utils/iconMap';

interface IconRendererProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const IconRenderer: React.FC<IconRendererProps> = React.memo(({
  name,
  size = 20,
  className = '',
  style,
}) => {
  return React.createElement(getIconComponent(name), { size, className, style });
});
