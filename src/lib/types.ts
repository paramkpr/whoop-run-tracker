// src/lib/types/whoop.ts
export interface ZoneDuration {
    zone_zero_milli: number;
    zone_one_milli: number;
    zone_two_milli: number;
    zone_three_milli: number;
    zone_four_milli: number;
    zone_five_milli: number;
  }
  
  export interface WorkoutScore {
    strain: number;
    average_heart_rate: number;
    max_heart_rate: number;
    kilojoule: number;
    percent_recorded: number;
    distance_meter: number;
    altitude_gain_meter: number;
    altitude_change_meter: number;
    zone_duration: ZoneDuration;
  }
  
  export interface Workout {
    id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
    start: string;
    end: string;
    timezone_offset: string;
    sport_id: number;
    score_state: string;
    score: WorkoutScore;
  }