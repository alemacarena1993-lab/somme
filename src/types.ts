export enum WineAcidity {
  LOW = 1,
  MEDIUM_LOW = 2,
  MEDIUM = 3,
  MEDIUM_HIGH = 4,
  HIGH = 5,
}

export enum WineTannins {
  LOW = 1,
  MEDIUM_LOW = 2,
  MEDIUM = 3,
  MEDIUM_HIGH = 4,
  HIGH = 5,
}

export enum WineIntensity {
  LOW = 1,
  MEDIUM_LOW = 2,
  MEDIUM = 3,
  MEDIUM_HIGH = 4,
  HIGH = 5,
}

export enum WineBody {
  LIGHT = 1,
  MEDIUM_LIGHT = 2,
  MEDIUM = 3,
  MEDIUM_FULL = 4,
  FULL = 5,
}

export interface WineProfile {
  acidity: WineAcidity;
  tannins: WineTannins;
  intensity: WineIntensity;
  body: WineBody;
}

export interface TastingNotes {
  visual: string;
  nose: string;
  mouth: string;
}

export interface FoodPairing {
  classic: string[];
  vegetarian: string;
}

export interface WineRecommendation {
  name: string;
  winery: string;
  profileBrief: string; // "Cuerpo alto, acidez media..."
  reason: string;
  visualReference: string;
  imageUrl: string;
}

export interface TechnicalSheet {
  id: string; // Unique registration ID
  name: string;
  winery: string;
  grape: string;
  vintage: string;
  region: string;
  subzone: string;
  country: string;
  profile: WineProfile;
  tastingNotes: TastingNotes;
  pairings: FoodPairing;
  recommendations: WineRecommendation[];
  imageUrl?: string;
}

export interface UserWineEntry extends TechnicalSheet {
  userRating: number; // 1-5
  userNotes: string;
  createdAt: number;
}
