export const useRegistrationEnabled = () => {
  const config = useRuntimeConfig();
  return {
    registrationEnabled: config.public.registrationEnabled
  };
};
