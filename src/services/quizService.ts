import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

export interface QuizAnswer {
  user_answer: number;
  correct_answer: number;
}

export interface QuizResult {
  is_correct: boolean;
  message: string;
}

export interface TipOfTheDay {
  title: string;
  tip: string;
  category: string;
  difficulty: string;
  benefits: string;
}

class QuizService {
  // Add method to get auth headers (similar to your api.ts)
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async generateQuestion(): Promise<QuizQuestion> {
    try {
      const response = await axios.get(`${API_BASE_URL}/quiz/generate-question`, {
        headers: this.getAuthHeaders() // Add authentication headers
      });
      return response.data;
    } catch (error) {
      console.error('Error generating quiz question:', error);
      // Enhanced error handling
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new Error('Authentication required. Please log in.');
        }
      }
      // Fallback question
      return {
        question: "Which nutrient provides the most energy per gram?",
        options: ["Protein", "Carbohydrates", "Fats", "Vitamins"],
        correct_answer: 2,
        explanation: "Fats provide 9 calories per gram, while proteins and carbohydrates provide 4 calories per gram each."
      };
    }
  }

  async submitAnswer(answerData: QuizAnswer): Promise<QuizResult> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/quiz/submit-answer`,
        answerData,
        {
          headers: this.getAuthHeaders() // Add authentication headers
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting quiz answer:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new Error('Authentication required. Please log in.');
        }
      }
      return {
        is_correct: false,
        message: "Error submitting answer. Please try again."
      };
    }
  }

  async getTipOfTheDay(): Promise<TipOfTheDay> {
    try {
      const response = await axios.get(`${API_BASE_URL}/quiz/tip-of-the-day`, {
        headers: this.getAuthHeaders() // Add authentication headers if needed
      });
      return response.data;
    } catch (error) {
      console.error('Error getting tip of the day:', error);
      // Fallback tip
      return {
        title: "Mindful Eating",
        tip: "Take time to chew your food slowly and savor each bite. This helps with digestion and prevents overeating.",
        category: "Nutrition",
        difficulty: "Easy",
        benefits: "Mindful eating improves digestion, helps with portion control, and increases meal satisfaction."
      };
    }
  }
}

export default new QuizService();
