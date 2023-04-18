export const storeKey = "store";
import { inject } from "vue";
export function useStore(injectKey = storeKey) {
  return inject(injectKey);
}
