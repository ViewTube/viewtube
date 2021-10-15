import { actionTree, NuxtStoreInput, NuxtStore, ActionContext, NormalisedActionHandler } from 'typed-vuex';

declare type Not<T, M> = T extends M ? never : T;
declare type StateObject = Not<Record<string, any>, Function>;
declare type StateFunction = Not<() => unknown | any, Record<string, any>>;
declare type State = StateObject | StateFunction;
declare type StateType<T extends State> = T extends () => any ? ReturnType<T> : T;

interface ActionHandler<T extends NuxtStore> {
  (this: any, injectee: ActionContext<T>, payload?: any): any;
}
interface ModifiedActionTree<T extends NuxtStore> {
  [key: string]: ActionHandler<T>;
}

declare type NormalisedActionTree<T extends ModifiedActionTree<any>> = {
  [P in keyof T]: NormalisedActionHandler<T[P]>;
};

type Getter<S, R> = (state: S, getters: any, rootState: R, rootGetters: any) => any;
type Mutation<S> = (state: S, payload?: any) => any;

interface GetterTree<S, R> {
  [key: string]: Getter<S, R>;
}
interface MutationTree<S> {
  [key: string]: Mutation<S>;
}

export const declareActionTree = <
  S extends Record<string, any>,
  G extends GetterTree<StateType<S>, any>,
  M extends MutationTree<StateType<S>>,
  T extends ModifiedActionTree<Required<NuxtStoreInput<S, G, M, {}, {}>>>
>(
  _store: NuxtStoreInput<S, G, M, {}, {}>,
  tree: T
): NormalisedActionTree<T> => {
  return actionTree(_store, tree);
};
