export declare class DictionaryService {
  findAll(): Promise<
    {
      id: string;
      name: string;
      description: string | null;
      category: string;
      language: string;
      languageCategory: string;
      tags: string;
      wordCount: number;
      userId: string | null;
      createdAt: number;
      updatedAt: number;
    }[]
  >;
  findById(id: string): Promise<{
    id: string;
    name: string;
    description: string | null;
    category: string;
    language: string;
    languageCategory: string;
    tags: string;
    wordCount: number;
    userId: string | null;
    createdAt: number;
    updatedAt: number;
  }>;
}
