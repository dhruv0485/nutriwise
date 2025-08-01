import axios from 'axios';

const API_BASE_URL = 'https://nutriwise-m0ob.onrender.com/api';

export interface MythFact {
  id: number;
  myth: string;
  fact: string;
  explanation: string;
}

export interface MythsResponse {
  myths: MythFact[];
}

export interface SingleMyth {
  myth: string;
  fact: string;
  explanation: string;
}

class MythService {
  // Add method to get auth headers
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async generateMyths(): Promise<MythsResponse> {
    try {
      console.log('Fetching myths from API...');
      // Add cache-busting parameter to ensure fresh content
      const timestamp = Date.now();
      const response = await axios.get(`${API_BASE_URL}/myth/generate-myths?t=${timestamp}`, {
        headers: this.getAuthHeaders(),
        timeout: 30000 // 30 second timeout
      });
      
      console.log('Myths API response:', response.data);
      
      // Validate the response structure
      if (response.data && response.data.myths && Array.isArray(response.data.myths)) {
        console.log('Valid myths data received:', response.data.myths.length, 'myths');
        return response.data;
      } else {
        console.error('Invalid myths response structure:', response.data);
        throw new Error('Invalid response structure from myths API');
      }
    } catch (error) {
      console.error('Error generating myths:', error);
      
      // Enhanced error handling
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new Error('Authentication required. Please log in to access myth features.');
        } else if (error.response?.status === 500) {
          throw new Error('Server error occurred while generating myths. Please try again.');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out. Please try again.');
        }
      }
      
      // Fallback myths
      console.log('Using fallback myths due to API error');
      return {
        myths: [
          {
            id: 1,
            myth: 'Myth: Carbs make you gain weight',
            fact: 'Fact: Excess calories, not carbs themselves, lead to weight gain',
            explanation: 'Carbohydrates are an essential macronutrient that provides energy for your body. Weight gain occurs when you consume more calories than you burn, regardless of the source.'
          },
          {
            id: 2,
            myth: 'Myth: You need to drink 8 glasses of water daily',
            fact: 'Fact: Water needs vary based on individual factors',
            explanation: 'Your hydration needs depend on your activity level, climate, overall health, and body size. Listen to your body and drink when thirsty.'
          },
          {
            id: 3,
            myth: 'Myth: Eating fat makes you fat',
            fact: 'Fact: Healthy fats are essential for optimal health',
            explanation: 'Healthy fats like those found in avocados, nuts, and olive oil are crucial for hormone production, nutrient absorption, and brain function.'
          },
          {
            id: 4,
            myth: 'Myth: Skipping meals helps you lose weight faster',
            fact: 'Fact: Regular meals support healthy metabolism',
            explanation: 'Skipping meals can slow your metabolism and lead to overeating later. Consistent, balanced meals help maintain stable blood sugar levels.'
          }
        ]
      };
    }
  }

  async getRandomMyth(): Promise<SingleMyth> {
    try {
      const response = await axios.get(`${API_BASE_URL}/myth/random-myth`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error getting random myth:', error);
      // Fallback random myth
      return {
        myth: 'Myth: All calories are equal',
        fact: 'Fact: The source of calories matters for health',
        explanation: 'While calories determine weight change, the source affects metabolism, hunger, and overall health. 100 calories from vegetables impact your body differently than 100 calories from candy.'
      };
    }
  }
}

export default new MythService();
