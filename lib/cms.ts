import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'cms-data.json');

export interface CMSData {
  header: {
    brandName: string;
    logo: string;
    navItems: Array<{
      id: string;
      label: string;
      href: string;
      icon: string;
    }>;
    ctaButton: {
      text: string;
      href: string;
    };
  };
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaHref: string;
    backgroundImage: string;
  };
  services: {
    title: string;
    subtitle: string;
    items: Array<{
      id: string;
      title: string;
      description: string;
      image: string;
      features: string[];
      duration?: string;
      price?: string;
    }>;
  };
  about: {
    title: string;
    subtitle: string;
    features: Array<{
      id: string;
      title: string;
      description: string;
      icon: string;
    }>;
  };
  footer: {
    brandName: string;
    logo: string;
    description: string;
    services: Array<{
      name: string;
      href: string;
    }>;
    quickLinks: Array<{
      name: string;
      href: string;
    }>;
    contact: {
      address: string;
      phone: string;
      email: string;
    };
    socialMedia: {
      facebook: string;
      instagram: string;
      twitter: string;
    };
    copyright: string;
    legalLinks: Array<{
      name: string;
      href: string;
    }>;
  };
  contact: {
    title: string;
    subtitle: string;
    email: string;
  };
}

export function getCMSData(): CMSData {
  try {
    const fileContents = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading CMS data:', error);
    throw new Error('Failed to read CMS data');
  }
}

export function saveCMSData(data: CMSData): void {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving CMS data:', error);
    throw new Error('Failed to save CMS data');
  }
}

export function updateCMSData(section: keyof CMSData, data: any): CMSData {
  const currentData = getCMSData();
  const updatedData = {
    ...currentData,
    [section]: data,
  };
  saveCMSData(updatedData);
  return updatedData;
}
