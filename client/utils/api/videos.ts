export const getDislikes = (id: string | string[]) => {
  const { apiUrl } = useApiUrl();

  return vtClientFetch<ApiDto<'DislikeDto'>>(`${apiUrl.value}videos/dislikes/${id}`);
};
