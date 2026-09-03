import { ReactNode } from 'react';

export interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  title?: string;
}

export interface CardProps {
  title: string;
  description: string;
  image?: string;
  children?: ReactNode;
  className?: string;
}

export interface SectionProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}

export interface HeroProps {
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  backgroundImage?: string;
}

export interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    description: string;
    image: string;
    price?: string;
  };
  index?: number;
}
