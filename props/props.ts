

export type Show = {
  rank?: number;
  prevRank?: number;
  id: string;
  title: string;
  year?: number;
  releaseDate?: string;
  image?: string;
  rating?: number;
  votes?: number;
  titleGenres?: string[];
  certificate?: string;
  plot?: string;
  type?: string;
  episodes?: number; 
};

export type Searched_Show = {
  id: string;
  imageType: string;
  titleNameText: string;
  titlePosterImageModel_url?: string;
  titleReleaseText?: number;
  titleTypeText?: string;
  topCredits?: string[];
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
          rank: e.currentRank,
          prevRank: e.previousRank,
          id: node?.id,
          title: node?.titleText?.text ?? "Unknown",
          year: node?.releaseYear?.year,
          releaseDate: node?.releaseDate
            ? `${node.releaseDate.day ?? ""}/${node.releaseDate.month ?? ""}/${node.releaseDate.year ?? ""}`
            : undefined,
          image: node?.primaryImage?.url,
          rating: node?.ratingsSummary?.aggregateRating,
          votes: node?.ratingsSummary?.voteCount,
          titleGenres: Array.isArray(node?.titleGenres?.genres)
            ? node.titleGenres.genres.map((g: any) => g?.genre?.text ?? "")
            : [],
          certificate: node?.certificate?.rating,
          plot: node?.plot?.plotText?.plainText,
          type: node?.titleType?.text,
          episodes: node?.episodes?.episodes?.total,
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
            imageType: e.imageType,
            titleNameText: e.titleNameText,
            titlePosterImageModel_url: e.titlePosterImageModel?.url ?? null,
            titleReleaseText: e.titleReleaseText ?? "",
            titleTypeText: e.titleTypeText ?? "",
            topCredits: e.topCredits ?? [],
          })
        );
    } catch (err) {
      console.error("Parse error:", err);
      return [];
    }
  };