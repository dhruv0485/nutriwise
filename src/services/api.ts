const API_BASE_URL = 'http://localhost:8000/api';

export interface RegisterData {
  fullName: string;
  dateOfBirth: string;
  city: string;
  state: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  city: string;
  state: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async register(userData: RegisterData): Promise<UserResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        full_name: userData.fullName,
        date_of_birth: userData.dateOfBirth,
        city: userData.city,
        state: userData.state,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Registration failed');
    }

    return response.json();
  }

  async login(credentials: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }

    const data = await response.json();
    // Store token in localStorage
    localStorage.setItem('access_token', data.access_token);
    return data;
  }

  async getCurrentUser(): Promise<UserResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get user data');
    }

    return response.json();
  }

  async logout(): Promise<void> {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    localStorage.removeItem('access_token');
  }
}

export const apiService = new ApiService();
