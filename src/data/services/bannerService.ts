import api from "./api";

export type Banner = {
  id: number | string;
  image_url: string;
};

type BannersApiResponse = Banner[] | { results: Banner[] };

export const getBanners = async (): Promise<Banner[]> => {
  const { data } = await api.get<BannersApiResponse>("banners/");

  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.results)) {
    return data.results;
  }

  return [];
};

