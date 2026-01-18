const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Vehicle API
export const vehicleApi = {
  getAll: () => request<{ vehicles: unknown[] }>('/api/v1/vehicles'),
  getById: (id: string) => request<unknown>(`/api/v1/vehicles/${id}`),
  updateStatus: (id: string, status: string) =>
    request(`/api/v1/vehicles/${id}/status`, { method: 'PATCH', body: { status } }),
};

// Optimization API
export const optimizationApi = {
  start: (data: {
    deliveryLocations: { lat: number; lng: number; id: string }[];
    numVehicles: number;
    depotLocation: { lat: number; lng: number };
  }) =>
    request<{ runId: string; status: string }>('/api/v1/optimization/start', {
      method: 'POST',
      body: data,
    }),
  getStatus: (runId: string) =>
    request<unknown>(`/api/v1/optimization/${runId}/status`),
  cancel: (runId: string) =>
    request(`/api/v1/optimization/${runId}/cancel`, { method: 'POST' }),
};

// Risk API
export const riskApi = {
  getAssessment: () => request<unknown>('/api/v1/risk/assessment'),
  getVehicleRisk: (vehicleId: string) =>
    request<unknown>(`/api/v1/risk/vehicle/${vehicleId}`),
  getPrediction: (vehicleId: string, horizon: number) =>
    request<unknown>(`/api/v1/risk/predict/${vehicleId}?horizon=${horizon}`),
};

// Communication API
export const communicationApi = {
  generateMessage: (data: {
    customerId: string;
    context: string;
    tone: string;
  }) =>
    request<{ message: string }>('/api/v1/communication/generate', {
      method: 'POST',
      body: data,
    }),
  analyzeSentiment: (text: string) =>
    request<{ positive: number; negative: number; neutral: number }>(
      '/api/v1/communication/sentiment',
      { method: 'POST', body: { text } }
    ),
};

// Fairness API
export const fairnessApi = {
  getAudit: () => request<unknown>('/api/v1/fairness/audit'),
  runCounterfactual: (data: { customerId: string; changes: Record<string, unknown> }) =>
    request<unknown>('/api/v1/fairness/counterfactual', {
      method: 'POST',
      body: data,
    }),
};

// Ethics API
export const ethicsApi = {
  getScenarios: () => request<unknown>('/api/v1/ethics/scenarios'),
  runSimulation: (data: { scenarioId: string; decision: string }) =>
    request<unknown>('/api/v1/ethics/simulate', {
      method: 'POST',
      body: data,
    }),
};

// Stakeholder API
export const stakeholderApi = {
  getNetwork: () => request<unknown>('/api/v1/stakeholders/network'),
  getImpact: (stakeholderId: string, policyId: string) =>
    request<unknown>(`/api/v1/stakeholders/${stakeholderId}/impact/${policyId}`),
};

// Policy API
export const policyApi = {
  generate: (data: { type: string; context: Record<string, unknown> }) =>
    request<{ document: string }>('/api/v1/policy/generate', {
      method: 'POST',
      body: data,
    }),
  getTemplates: () => request<unknown>('/api/v1/policy/templates'),
};
