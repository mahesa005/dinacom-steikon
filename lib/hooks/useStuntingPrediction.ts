/**
 * React Hook untuk Stunting Prediction
 */

import { useState } from 'react';
import type {
  StuntingPredictionInput,
  StuntingPredictionResponse,
  StuntingExplanationResponse,
  ApiError,
} from '@/lib/stunting-prediction';

// ==================== Prediction Hook ====================

interface UsePredictionState {
  data: StuntingPredictionResponse | null;
  loading: boolean;
  error: ApiError | null;
}

interface UsePredictionReturn extends UsePredictionState {
  predict: (input: StuntingPredictionInput) => Promise<void>;
  reset: () => void;
}

/**
 * Hook untuk prediksi stunting
 * 
 * @example
 * ```tsx
 * const { data, loading, error, predict, reset } = useStuntingPrediction();
 * 
 * const handlePredict = async () => {
 *   await predict({
 *     mother_height_cm: 155.5,
 *     father_height_cm: 170.0,
 *     mother_edu_level: 3,
 *     father_edu_level: 4,
 *     toilet_standard: 1,
 *     waste_mgmt_std: 1
 *   });
 * };
 * ```
 */
export function useStuntingPrediction(): UsePredictionReturn {
  const [state, setState] = useState<UsePredictionState>({
    data: null,
    loading: false,
    error: null,
  });

  const predict = async (input: StuntingPredictionInput) => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await fetch('/api/stunting/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setState({
          data: null,
          loading: false,
          error: {
            error: errorData.error || 'Prediction failed',
            details: errorData.details,
            status: response.status,
          },
        });
        return;
      }

      const data: StuntingPredictionResponse = await response.json();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: {
          error: error instanceof Error ? error.message : 'Network error',
          details: 'Failed to connect to server',
          status: 0,
        },
      });
    }
  };

  const reset = () => {
    setState({ data: null, loading: false, error: null });
  };

  return { ...state, predict, reset };
}

// ==================== Explanation Hook ====================

interface UseExplanationState {
  data: StuntingExplanationResponse | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseExplanationReturn extends UseExplanationState {
  explain: (input: StuntingPredictionInput) => Promise<void>;
  reset: () => void;
}

/**
 * Hook untuk mendapatkan penjelasan prediksi dengan SHAP values
 * 
 * @example
 * ```tsx
 * const { data, loading, error, explain, reset } = useStuntingExplanation();
 * 
 * const handleExplain = async () => {
 *   await explain({
 *     mother_height_cm: 155.5,
 *     father_height_cm: 170.0,
 *     mother_edu_level: 3,
 *     father_edu_level: 4,
 *     toilet_standard: 1,
 *     waste_mgmt_std: 1
 *   });
 * };
 * ```
 */
export function useStuntingExplanation(): UseExplanationReturn {
  const [state, setState] = useState<UseExplanationState>({
    data: null,
    loading: false,
    error: null,
  });

  const explain = async (input: StuntingPredictionInput) => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await fetch('/api/stunting/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setState({
          data: null,
          loading: false,
          error: {
            error: errorData.error || 'Explanation failed',
            details: errorData.details,
            status: response.status,
          },
        });
        return;
      }

      const data: StuntingExplanationResponse = await response.json();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: {
          error: error instanceof Error ? error.message : 'Network error',
          details: 'Failed to connect to server',
          status: 0,
        },
      });
    }
  };

  const reset = () => {
    setState({ data: null, loading: false, error: null });
  };

  return { ...state, explain, reset };
}
