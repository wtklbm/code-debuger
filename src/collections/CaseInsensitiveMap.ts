import { isString } from "../utils";

/**
 * A `case-insensitive` `Map`.
 *
 * All the keys are converted to lowercase in a locale-independent fashion.
 *
 * @template K The type of the keys in this map.
 * @template V The type of the values in this map.
 */
export class CaseInsensitiveMap<K, V> extends Map<K, V> {
  public delete(key: K): boolean {
    if (isString(key)) {
      return super.delete(key.toLocaleLowerCase() as any as K);
    }
    return super.delete(key);
  }

  public get(key: K) {
    if (isString(key)) {
      return super.get(key.toLocaleLowerCase() as any as K);
    }
    return super.get(key);
  }

  public has(key: K) {
    if (isString(key)) {
      return super.has(key.toLocaleLowerCase() as any as K);
    }
    return super.has(key);
  }

  public set(key: K, value: V) {
    if (isString(key)) {
      return super.set(key.toLocaleLowerCase() as any as K, value);
    }
    return super.set(key, value);
  }
}
