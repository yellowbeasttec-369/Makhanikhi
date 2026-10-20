import { auth } from '../lib/firebase';

/**
 * Fix #16: All internal API calls now include a Firebase ID token
 * in the Authorization header so unauthenticated callers cannot hit
 * /api/ai/* or /api/notify/* routes without a valid session.
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) return { 'Content-Type': 'application/json' };
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

export const generateSmartContract = async (serviceDetails: unknown) => {
  try {
    const response = await fetch('/api/ai/generate-contract', {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ serviceDetails })
    });

    if (!response.ok) throw new Error('AI Service request failed');
    return await response.json();
  } catch (error) {
    console.error('Error generating contract:', (error as Error).message);
    throw error;
  }
};

export const notifyParties = async (requestId: string, parties: unknown[], agreement: unknown) => {
  try {
    const response = await fetch('/api/notify/agreement-finalized', {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ requestId, parties, agreement })
    });
    return await response.json();
  } catch (error) {
    console.error('Error notifying parties:', (error as Error).message);
    throw error;
  }
};

export const addToCalendar = async (eventData: unknown, accessToken: string) => {
  try {
    const response = await fetch('/api/calendar/add-event', {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ eventData, accessToken })
    });
    return await response.json();
  } catch (error) {
    console.error('Error adding to calendar:', (error as Error).message);
    throw error;
  }
};

export const analyzeFaults = async (faults: string[], vehicleInfo: unknown) => {
  try {
    const response = await fetch('/api/ai/analyze-faults', {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ faults, vehicleInfo })
    });

    if (!response.ok) throw new Error('AI Service request failed');
    return await response.json();
  } catch (error) {
    console.error('Error analyzing faults:', (error as Error).message);
    throw error;
  }
};

export const notifyApprentice = async (notificationData: {
  apprenticeEmail: string;
  apprenticePhone: string;
  apprenticeName: string;
  specialistName: string;
  vehicleDetails: string;
  serviceType: string;
  description: string;
}) => {
  try {
    const response = await fetch('/api/notify/apprentice-assign', {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(notificationData)
    });
    if (!response.ok) throw new Error('Apprentice notification request failed');
    return await response.json();
  } catch (error) {
    console.error('Error notifying apprentice:', (error as Error).message);
    throw error;
  }
};
