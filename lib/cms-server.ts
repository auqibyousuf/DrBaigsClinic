import { getCMSData } from './cms';

export async function getCMSHeader() {
  try {
    const data = await getCMSData();
    return data.header;
  } catch {
    return null;
  }
}

export async function getCMSHero() {
  try {
    const data = await getCMSData();
    return data.hero;
  } catch {
    return null;
  }
}

export async function getCMSServices() {
  try {
    const data = await getCMSData();
    return data.services;
  } catch {
    return null;
  }
}

export async function getCMSAbout() {
  try {
    const data = await getCMSData();
    return data.about;
  } catch {
    return null;
  }
}

export async function getCMSFooter() {
  try {
    const data = await getCMSData();
    return data.footer;
  } catch {
    return null;
  }
}

export async function getCMSContact() {
  try {
    const data = await getCMSData();
    return data.contact;
  } catch {
    return null;
  }
}

export async function getCMSDoctors() {
  try {
    const data = await getCMSData();
    return data.doctors || { items: [] };
  } catch {
    return { items: [] };
  }
}

export async function getCMSBookingSettings() {
  try {
    const data = await getCMSData();
    return data.bookingSettings || { closedDates: [], closedWeekdays: [] };
  } catch {
    return { closedDates: [], closedWeekdays: [] };
  }
}
