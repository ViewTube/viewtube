export const createDashManifestURI = (dashManifest: string) => {
  return 'data:application/dash+xml;charset=utf-8;base64,' + Buffer.from(dashManifest).toString('base64');
};