export declare class WordbookService {
  findAll(): Promise<
    {
      id: number;
      name: string;
      description: string | null;
      userId: string | null;
      createdAt: number;
      updatedAt: number;
    }[]
  >;
  create(
    name: string,
    description?: string
  ): Promise<import("@libsql/client").ResultSet>;
  update(
    id: number,
    data: {
      name?: string;
      description?: string;
    }
  ): Promise<import("@libsql/client").ResultSet>;
  delete(id: number): Promise<import("@libsql/client").ResultSet>;
  getWords(wordbookId: number): Promise<
    {
      id: number;
      name: string;
      trans: string;
      usphone: string | null;
      ukphone: string | null;
      notation: string | null;
      dictId: string;
    }[]
  >;
  addWord(
    wordbookId: number,
    wordId: number
  ): Promise<
    | import("@libsql/client").ResultSet
    | {
        id: number;
        sortOrder: number;
        wordId: number;
        wordbookId: number;
      }
  >;
  removeWord(
    wordbookId: number,
    wordId: number
  ): Promise<import("@libsql/client").ResultSet>;
}
