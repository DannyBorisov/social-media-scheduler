const serverURL = "http://localhost:3000";

class ApiClient {
  #baseURL: string;
  constructor(baseURL: string) {
    this.#baseURL = baseURL;
  }

  async get(endpoint: string, params?: Record<string, string>): Promise<any> {
    const url = new URL(`${this.#baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
  async post(endpoint: string, body: any): Promise<any> {
    const response = await fetch(`${this.#baseURL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

const apiClient = new ApiClient(serverURL);
export default apiClient;
