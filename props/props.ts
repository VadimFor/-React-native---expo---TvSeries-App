
//Info de la serie
export type Show = {
  id: string;
  rank?: number;
  title: string;
  image?: string;
  rating?: number;
  votes?: number;
  releaseDate?: string;
  plot?: string;
  titleGenres?: string[];
  episodes?: number;
  seasons?: number;
  trailer?: string;
};

//Para cuando buscas información adicional
export type Searched_Show = {
  id: string;
  titleNameText: string;
};


export const getTextClass = (rating: number) => {
    if (rating == null) return "text-gray-500";
    if (rating < 6) return "text-red-500";
    if (rating < 7) return "text-green-600";
    return "text-blue-600";
  };

export const parseDate = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split("/").map((v) => parseInt(v, 10));
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  };


export const json_parse_top100 = (rawJson: string): Show[] => {
    try {
      const json = JSON.parse(rawJson);
      const edges = json?.props?.pageProps?.pageData?.chartTitles?.edges || [];

      return edges.map((e: any): Show => {
        const node = e.node;
        return {
          id: node?.id,
          rank: e.currentRank,
          title: node?.titleText?.text ?? "Unknown",
          image: node?.primaryImage?.url,
          rating: node?.ratingsSummary?.aggregateRating,
          votes: node?.ratingsSummary?.voteCount,
          releaseDate: node?.releaseDate
            ? `${node.releaseDate.day ?? ""}/${node.releaseDate.month ?? ""}/${node.releaseDate.year ?? ""}`
            : undefined,
          plot: node?.plot?.plotText?.plainText,
          titleGenres: Array.isArray(node?.titleGenres?.genres)
            ? node.titleGenres.genres.map((g: any) => g?.genre?.text ?? "")
            : [],
          episodes: node?.episodes?.episodes?.total,
          seasons: undefined,
          trailer: undefined
        };
      });
    } catch (err) {
      console.error("Parse error:", err);
      return [];
    }
  };

export const json_parse_search = (rawJson: string): Searched_Show[] => {
    try {
      const json = JSON.parse(rawJson);
      const raw = json?.props?.pageProps?.titleResults?.results || [];

      return raw
        .filter(
          (e: any) =>
            e.imageType === "tvMiniSeries" || e.imageType === "tvSeries"
        )
        .map(
          (e: any): Searched_Show => ({
            id: e.id,
            titleNameText: e.titleNameText,
          })
        );
    } catch (err) {
      console.error("Parse error:", err);
      return [];
    }
  };


