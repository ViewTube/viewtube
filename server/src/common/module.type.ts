export type ModuleType = {
  hot: {
    accept: () => void;
    dispose: (callback: () => void) => void;
  };
};
