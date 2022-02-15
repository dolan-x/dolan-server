export const createSitemapUrls = <T extends { id: number }>(
  objs: T[],
  baseUrl: string,
) =>
  objs.map(({ id }) =>
    `  <url>
    <loc>${baseUrl}/${id}</loc>
  </url>
`
  ).join("");
