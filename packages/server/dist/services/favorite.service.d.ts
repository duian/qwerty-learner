export declare class FavoriteService {
  findAll(dictId?: string): Promise<
    {
      id: number;
      userId: string | null;
      createdAt: number;
      dictId: string;
      wordId: number;
    }[]
  >;
  create(
    wordId: number,
    dictId: string
  ): Promise<import("@libsql/client").ResultSet>;
  delete(id: number): Promise<import("@libsql/client").ResultSet>;
}
