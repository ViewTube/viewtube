import { UnwrapRef } from 'vue-demi';

type SetActionsType<T> = {
  [Key in keyof T & string as `set${Capitalize<Key>}`]: (newValue: T[Key]) => void;
};

type ValueOf<T> = T[keyof T];

export const insertSetters = <T>(state: T): SetActionsType<T> => {
  const setActions: any = {};

  for (const [key] of Object.entries(state)) {
    setActions[`set${key.charAt(0).toUpperCase()}${key.slice(1)}`] = function (
      this: UnwrapRef<T>,
      newValue: ValueOf<T>
    ) {
      this[key] = newValue;
    };
  }

  return setActions;
};
