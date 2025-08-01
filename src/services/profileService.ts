import axios from 'axios';

const API_BASE_URL = 'https://nutriwise-m0ob.onrender.com/api';

export interface HealthCondition {
  id: string;
  condition_name: string;
  diagnosed_date?: string;
  severity?: string;
  medications: string[];
  notes?: string;
  is_chronic: boolean;
  created_at: string;
  updated_at: string;
}

export interface DiseaseHistory {
  id: string;
  disease_name: string;
  onset_date?: string;
  recovery_date?: string;
  treatment_received?: string;
  complications: string[];
  family_history: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthProfile {
  blood_type?: string;
  height?: number;
  weight?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  allergies: string[];
  current_medications: string[];
  dietary_restrictions: string[];
  exercise_frequency?: string;
  smoking_status?: string;
  alcohol_consumption?: string;
  health_conditions: HealthCondition[];
  disease_history: DiseaseHistory[];
  last_updated: string;
}

export interface UserProfile {
  id: string;
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  city: string;
  state: string;
  role: string;
  is_active: boolean;
  health_profile?: HealthProfile;
  created_at: string;
}

export interface HealthConditionRequest {
  condition_name: string;
  diagnosed_date?: string;
  severity?: string;
  medications: string[];
  notes?: string;
  is_chronic: boolean;
}

export interface DiseaseHistoryRequest {
  disease_name: string;
  onset_date?: string;
  recovery_date?: string;
  treatment_received?: string;
  complications: string[];
  family_history: boolean;
  notes?: string;
}

class ProfileService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async getCurrentUserProfile(): Promise<UserProfile> {
    try {
      const response = await axios.get(`${API_BASE_URL}/profile/me`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching current user profile:', error);
      throw error;
    }
  }

  async getUserProfileById(userId: number): Promise<UserProfile> {
    try {
      const response = await axios.get(`${API_BASE_URL}/profile/user/${userId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile by ID:', error);
      throw error;
    }
  }

  async updateUserProfile(updateData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await axios.put(`${API_BASE_URL}/profile/update`, updateData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async addHealthCondition(conditionData: HealthConditionRequest): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE_URL}/profile/health-condition`, conditionData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error adding health condition:', error);
      throw error;
    }
  }

  async updateHealthCondition(conditionId: string, conditionData: HealthConditionRequest): Promise<any> {
    try {
      const response = await axios.put(`${API_BASE_URL}/profile/health-condition/${conditionId}`, conditionData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating health condition:', error);
      throw error;
    }
  }

  async deleteHealthCondition(conditionId: string): Promise<any> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/profile/health-condition/${conditionId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting health condition:', error);
      throw error;
    }
  }

  async addDiseaseHistory(diseaseData: DiseaseHistoryRequest): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE_URL}/profile/disease-history`, diseaseData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error adding disease history:', error);
      throw error;
    }
  }

  async updateDiseaseHistory(diseaseId: string, diseaseData: DiseaseHistoryRequest): Promise<any> {
    try {
      const response = await axios.put(`${API_BASE_URL}/profile/disease-history/${diseaseId}`, diseaseData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error updating disease history:', error);
      throw error;
    }
  }

  async deleteDiseaseHistory(diseaseId: string): Promise<any> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/profile/disease-history/${diseaseId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting disease history:', error);
      throw error;
    }
  }
}

export default new ProfileService();
