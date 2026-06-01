export const generateSmartContract = async (serviceDetails: any) => {
  try {
    const response = await fetch('/api/ai/generate-contract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceDetails })
    });
    
    if (!response.ok) throw new Error('AI Service request failed');
    return await response.json();
  } catch (error) {
    console.error('Error generating contract:', error);
    throw error;
  }
};

export const notifyParties = async (requestId: string, parties: any[], agreement: any) => {
  try {
    const response = await fetch('/api/notify/agreement-finalized', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, parties, agreement })
    });
    return await response.json();
  } catch (error) {
    console.error('Error notifying parties:', error);
    throw error;
  }
};

export const addToCalendar = async (eventData: any, accessToken: string) => {
  try {
    const response = await fetch('/api/calendar/add-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventData, accessToken })
    });
    return await response.json();
  } catch (error) {
    console.error('Error adding to calendar:', error);
    throw error;
  }
};

export const analyzeFaults = async (faults: string[], vehicleInfo: any) => {
  try {
    const response = await fetch('/api/ai/analyze-faults', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faults, vehicleInfo })
    });
    
    if (!response.ok) throw new Error('AI Service request failed');
    return await response.json();
  } catch (error) {
    console.error('Error analyzing faults:', error);
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationData)
    });
    if (!response.ok) throw new Error('Apprentice notification request failed');
    return await response.json();
  } catch (error) {
    console.error('Error notifying apprentice:', error);
    throw error;
  }
};

