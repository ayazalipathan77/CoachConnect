export interface Coach {
  id: string;
  name: string;
  sport: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  imageUrl: string;
  location: string;
  tags: string[];
  experienceLevel: 'Beginner-friendly' | 'Intermediate' | 'Advanced' | 'Elite';
  availability: string;
}

export interface Sport {
  id: string;
  name: string;
  category: string;
  icon: string;
}
