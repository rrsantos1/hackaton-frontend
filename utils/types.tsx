// types.ts
  
  export interface Activity {
    id: number;
    title: string;
    description?: string;
    category: string;
    type: string;
    status: string;
    coverImage?: string;
    content?: {
      questions?: {
        question: string; options: string[]; correctAnswer: string;  
}[];
    };
    config?: { timeLimit?: number; shuffleQuestions?: boolean };
    createdAt: string;
    updatedAt: string;
    user: {
      id: number;
      name: string;
      email: string;
    }
  }