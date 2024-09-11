import type { UnwrapRef } from 'vue-demi';

type SetActionsType<T> = {
  [Key in keyof T & string as `set${Capitalize<Key>}`]: (newValue: UnwrapRef<T[Key]>) => void;
};

type ValueOf<T> = T[keyof T];

export const insertSetters = <T>(
  state: T,
  callback?: (...params: any) => any
): SetActionsType<T> => {
  const setActions: any = {};

  for (const [key] of Object.entries(state)) {
    setActions[`set${key.charAt(0).toUpperCase()}${key.slice(1)}`] = async function (
      this: UnwrapRef<T>,
      newValue: UnwrapRef<ValueOf<T>>
    ) {
      this[key] = newValue;
      if (callback && typeof callback === 'function') {
        await callback();
      }
    };
  }

  return setActions;
};
