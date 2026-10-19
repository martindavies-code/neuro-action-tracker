import React from 'react';
import {
  Sparkles,
  Utensils,
  Droplets,
  Activity,
  Pill,
  CheckCircle2,
  Moon,
  Sun,
  Flame,
  Target,
  Zap,
  Award,
  PenTool,
  Clock,
  Heart,
  Smile,
  BookOpen,
  Coffee,
  Check,
  Plus,
  Trash2,
  Edit2,
  Sliders,
  BarChart2,
  ListTodo,
  Volume2,
  VolumeX,
  RefreshCw,
  Download,
  Upload,
  HelpCircle,
  Shield,
  Palette,
  Eye,
  Search,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Utensils,
  Droplets,
  Activity,
  Pill,
  CheckCircle2,
  Moon,
  Sun,
  Flame,
  Target,
  Zap,
  Award,
  PenTool,
  Clock,
  Heart,
  Smile,
  BookOpen,
  Coffee,
  Check,
  Plus,
  Trash2,
  Edit2,
  Sliders,
  BarChart2,
  ListTodo,
  Volume2,
  VolumeX,
  RefreshCw,
  Download,
  Upload,
  HelpCircle,
  Shield,
  Palette,
  Eye,
  Search,
};

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
  const IconComponent = ICON_MAP[name] || CheckCircle2;
  return <IconComponent size={size} className={className} style={style} />;
});
