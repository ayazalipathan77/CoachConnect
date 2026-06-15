import { Coach, Sport } from './types';

export const sports: Sport[] = [
  { id: '1', name: 'Tennis', category: 'Racquet', icon: 'tennis' },
  { id: '2', name: 'Football', category: 'Team', icon: 'football' },
  { id: '3', name: 'Personal Training', category: 'Fitness', icon: 'dumbbell' },
  { id: '4', name: 'Swimming', category: 'Water', icon: 'waves' },
  { id: '5', name: 'Boxing', category: 'Martial Arts', icon: 'boxing' },
  { id: '6', name: 'Yoga', category: 'Flexibility', icon: 'yoga' },
];

export const coaches: Coach[] = [
  {
    id: 'c1',
    name: 'Marcus Chen',
    sport: 'Tennis',
    rating: 4.9,
    reviews: 124,
    hourlyRate: 85,
    imageUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=800&q=80',
    location: 'London, UK (2.5mi)',
    tags: ['LTA Level 4', 'Tour Experience'],
    experienceLevel: 'Elite',
    availability: 'Available this week'
  },
  {
    id: 'c2',
    name: 'Sarah Jenkins',
    sport: 'Personal Training',
    rating: 5.0,
    reviews: 89,
    hourlyRate: 60,
    imageUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=800&q=80',
    location: 'Manchester, UK (5mi)',
    tags: ['Strength', 'Nutrition Certified'],
    experienceLevel: 'Beginner-friendly',
    availability: 'Next week'
  },
  {
    id: 'c3',
    name: 'David Okafor',
    sport: 'Boxing',
    rating: 4.8,
    reviews: 210,
    hourlyRate: 75,
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    location: 'Birmingham, UK (1.2mi)',
    tags: ['Ex-Pro', 'Technique Focus'],
    experienceLevel: 'Advanced',
    availability: 'Available this week'
  },
  {
    id: 'c4',
    name: 'Elena Rostova',
    sport: 'Yoga',
    rating: 4.9,
    reviews: 340,
    hourlyRate: 50,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    location: 'Remote / Virtual',
    tags: ['Ashtanga', 'Mindfulness'],
    experienceLevel: 'Beginner-friendly',
    availability: 'Available today'
  },
  {
    id: 'c5',
    name: 'James Wright',
    sport: 'Swimming',
    rating: 4.7,
    reviews: 56,
    hourlyRate: 65,
    imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
    location: 'London, UK (4mi)',
    tags: ['Triathlon prep', 'Video analysis'],
    experienceLevel: 'Intermediate',
    availability: 'Available this week'
  },
  {
    id: 'c6',
    name: 'Anita Patel',
    sport: 'Football',
    rating: 4.9,
    reviews: 178,
    hourlyRate: 55,
    imageUrl: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=800&q=80',
    location: 'Leeds, UK (3mi)',
    tags: ['UEFA B License', '1-on-1 Drills'],
    experienceLevel: 'Advanced',
    availability: 'Next week'
  }
];
