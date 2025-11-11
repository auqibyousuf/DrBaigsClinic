export interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  features: string[];
  duration?: string;
  price?: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
  image?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  image: string;
  qualifications: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
}

