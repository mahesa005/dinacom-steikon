/**
 * Stunting Prediction API Service
 * Base URL: https://bravo86-stunting.hf.space
 */

const BASE_URL = 'https://bravo86-stunting.hf.space';

// ==================== Interfaces ====================

/**
 * Input data untuk prediksi stunting
 */
export interface StuntingPredictionInput {
  /** Tinggi ibu dalam cm (contoh: 155.5) */
  mother_height_cm: number;
  /** Tinggi ayah dalam cm (contoh: 170.0) */
  father_height_cm: number;
  /** Level pendidikan ibu (1-5) */
  mother_edu_level: number;
  /** Level pendidikan ayah (1-5) */
  father_edu_level: number;
  /** Standar toilet (0-2) */
  toilet_standard: number;
  /** Standar pengelolaan limbah (0-2) */
  waste_mgmt_std: number;
}

/**
 * Response dari API /predict
 */
export interface StuntingPredictionResponse {
  /** Apakah terdeteksi stunting (true/false) */
  is_stunting: boolean;
  /** Tingkat risiko stunting dalam persen (0-100) */
  stunting_risk: number;
  /** Confidence score dari model (0-1) */
  confidence: number;
  /** Input features yang digunakan untuk prediksi */
  input_features: {
    mother_height_cm: number;
    father_height_cm: number;
    mother_edu_level: number;
    father_edu_level: number;
    toilet_standard: number;
    waste_mgmt_std: number;
  };
}

/**
 * SHAP value untuk satu fitur
 */
export interface ShapValue {
  /** Nama fitur */
  feature: string;
  /** Nilai SHAP (kontribusi terhadap prediksi) */
  value: number;
  /** Nilai asli dari fitur */
  feature_value: number;
}

/**
 * Response dari API /explain
 */
export interface StuntingExplanationResponse {
  /** Apakah terdeteksi stunting */
  is_stunting: boolean;
  /** Tingkat risiko stunting dalam persen */
  stunting_risk: number;
  /** Confidence score */
  confidence: number;
  /** SHAP values untuk setiap fitur */
  shap_values: ShapValue[];
  /** Base value dari model */
  base_value: number;
  /** Input features yang digunakan */
  input_features: {
    mother_height_cm: number;
    father_height_cm: number;
    mother_edu_level: number;
    father_edu_level: number;
    toilet_standard: number;
    waste_mgmt_std: number;
  };
}

/**
 * API Error response
 */
export interface ApiError {
  error: string;
  details?: string;
  status: number;
}

/**
 * Result type untuk fungsi dengan error handling
 */
export type ApiResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ApiError };

// ==================== Helper Functions ====================

/**
 * Validasi input data
 */
function validateInput(input: StuntingPredictionInput): string | null {
  const { mother_height_cm, father_height_cm, mother_edu_level, father_edu_level, toilet_standard, waste_mgmt_std } = input;

  // Validasi tinggi
  if (mother_height_cm < 100 || mother_height_cm > 200) {
    return 'Tinggi ibu harus antara 100-200 cm';
  }
  if (father_height_cm < 100 || father_height_cm > 220) {
    return 'Tinggi ayah harus antara 100-220 cm';
  }

  // Validasi education level
  if (mother_edu_level < 1 || mother_edu_level > 5 || !Number.isInteger(mother_edu_level)) {
    return 'Level pendidikan ibu harus antara 1-5';
  }
  if (father_edu_level < 1 || father_edu_level > 5 || !Number.isInteger(father_edu_level)) {
    return 'Level pendidikan ayah harus antara 1-5';
  }

  // Validasi toilet & waste management standard
  if (toilet_standard < 0 || toilet_standard > 2 || !Number.isInteger(toilet_standard)) {
    return 'Standar toilet harus antara 0-2';
  }
  if (waste_mgmt_std < 0 || waste_mgmt_std > 2 || !Number.isInteger(waste_mgmt_std)) {
    return 'Standar pengelolaan limbah harus antara 0-2';
  }

  return null;
}

/**
 * Handle fetch errors
 */
async function handleFetchError(response: Response): Promise<ApiError> {
  let errorMessage = 'Unknown error occurred';
  let details = '';

  try {
    const errorData = await response.json();
    errorMessage = errorData.error || errorData.message || errorMessage;
    details = errorData.details || '';
  } catch {
    errorMessage = response.statusText || errorMessage;
  }

  return {
    error: errorMessage,
    details,
    status: response.status,
  };
}

// ==================== Main Functions ====================

/**
 * Prediksi stunting berdasarkan input data
 * 
 * @param input - Data input untuk prediksi
 * @returns Promise dengan hasil prediksi atau error
 * 
 * @example
 * ```typescript
 * const result = await predictStunting({
 *   mother_height_cm: 155.5,
 *   father_height_cm: 170.0,
 *   mother_edu_level: 3,
 *   father_edu_level: 4,
 *   toilet_standard: 1,
 *   waste_mgmt_std: 1
 * });
 * 
 * if (result.success) {
 *   console.log('Risiko stunting:', result.data.stunting_risk + '%');
 * } else {
 *   console.error('Error:', result.error.error);
 * }
 * ```
 */
export async function predictStunting(
  input: StuntingPredictionInput
): Promise<ApiResult<StuntingPredictionResponse>> {
  try {
    // Validasi input
    const validationError = validateInput(input);
    if (validationError) {
      return {
        success: false,
        error: {
          error: validationError,
          status: 400,
        },
      };
    }

    // Kirim request ke API
    const response = await fetch(`${BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(input),
    });

    // Handle error response
    if (!response.ok) {
      const error = await handleFetchError(response);
      return { success: false, error };
    }

    // Parse response
    const data: StuntingPredictionResponse = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        error: error instanceof Error ? error.message : 'Network error occurred',
        details: 'Failed to connect to prediction API',
        status: 0,
      },
    };
  }
}

/**
 * Dapatkan penjelasan prediksi dengan SHAP values
 * 
 * @param input - Data input untuk prediksi
 * @returns Promise dengan hasil prediksi dan SHAP values atau error
 * 
 * @example
 * ```typescript
 * const result = await explainStunting({
 *   mother_height_cm: 155.5,
 *   father_height_cm: 170.0,
 *   mother_edu_level: 3,
 *   father_edu_level: 4,
 *   toilet_standard: 1,
 *   waste_mgmt_std: 1
 * });
 * 
 * if (result.success) {
 *   console.log('SHAP values:', result.data.shap_values);
 *   result.data.shap_values.forEach(shap => {
 *     console.log(`${shap.feature}: ${shap.value}`);
 *   });
 * }
 * ```
 */
export async function explainStunting(
  input: StuntingPredictionInput
): Promise<ApiResult<StuntingExplanationResponse>> {
  try {
    // Validasi input
    const validationError = validateInput(input);
    if (validationError) {
      return {
        success: false,
        error: {
          error: validationError,
          status: 400,
        },
      };
    }

    // Kirim request ke API
    const response = await fetch(`${BASE_URL}/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(input),
    });

    // Handle error response
    if (!response.ok) {
      const error = await handleFetchError(response);
      return { success: false, error };
    }

    // Parse response
    const data: StuntingExplanationResponse = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        error: error instanceof Error ? error.message : 'Network error occurred',
        details: 'Failed to connect to explanation API',
        status: 0,
      },
    };
  }
}

// ==================== Utility Functions ====================

/**
 * Format risiko stunting menjadi kategori
 */
export function getRiskCategory(risk: number): {
  category: 'LOW' | 'MEDIUM' | 'HIGH';
  label: string;
  color: string;
} {
  if (risk < 30) {
    return {
      category: 'LOW',
      label: 'Risiko Rendah',
      color: 'green',
    };
  } else if (risk < 70) {
    return {
      category: 'MEDIUM',
      label: 'Risiko Sedang',
      color: 'yellow',
    };
  } else {
    return {
      category: 'HIGH',
      label: 'Risiko Tinggi',
      color: 'red',
    };
  }
}

/**
 * Dapatkan top 3 faktor risiko berdasarkan SHAP values
 */
export function getTopRiskFactors(shapValues: ShapValue[]): ShapValue[] {
  return [...shapValues]
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, 3);
}

/**
 * Format nama fitur menjadi lebih readable
 */
export function formatFeatureName(feature: string): string {
  const featureNames: Record<string, string> = {
    mother_height_cm: 'Tinggi Ibu',
    father_height_cm: 'Tinggi Ayah',
    mother_edu_level: 'Pendidikan Ibu',
    father_edu_level: 'Pendidikan Ayah',
    toilet_standard: 'Standar Toilet',
    waste_mgmt_std: 'Pengelolaan Limbah',
  };

  return featureNames[feature] || feature;
}

/**
 * Mapping education level ke label
 */
export function getEducationLabel(level: number): string {
  const labels: Record<number, string> = {
    1: 'Tidak Sekolah',
    2: 'SD',
    3: 'SMP',
    4: 'SMA',
    5: 'Perguruan Tinggi',
  };

  return labels[level] || 'Unknown';
}

/**
 * Mapping toilet standard ke label
 */
export function getToiletStandardLabel(standard: number): string {
  const labels: Record<number, string> = {
    0: 'Buruk',
    1: 'Cukup',
    2: 'Baik',
  };

  return labels[standard] || 'Unknown';
}

/**
 * Mapping waste management standard ke label
 */
export function getWasteManagementLabel(standard: number): string {
  const labels: Record<number, string> = {
    0: 'Buruk',
    1: 'Cukup',
    2: 'Baik',
  };

  return labels[standard] || 'Unknown';
}
