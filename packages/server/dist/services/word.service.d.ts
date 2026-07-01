export declare class WordService {
  findByChapter(
    dictId: string,
    chapter: number,
    pageSize?: number
  ): Promise<
    {
      id: number;
      name: string;
      dictId: string;
      trans: string;
      usphone: string | null;
      ukphone: string | null;
      notation: string | null;
      sortOrder: number;
    }[]
  >;
  search(
    dictId: string,
    keyword: string
  ): Promise<
    {
      id: number;
      name: string;
      dictId: string;
      trans: string;
      usphone: string | null;
      ukphone: string | null;
      notation: string | null;
      sortOrder: number;
    }[]
  >;
}
