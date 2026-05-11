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
