export const useDeviceType = () => {
  const deviceTypes = new Map([
    ['desktop', 'mdi:monitor'],
    ['mobile', 'mdi:cellphone']
  ]);

  const deviceTypeIcons = [...deviceTypes.values()];

  return {
    deviceTypes,
    deviceTypeIcons
  };
};
