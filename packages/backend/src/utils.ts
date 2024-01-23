import { BehaviorSubject } from 'rxjs';

/**
 *
 * @description Updates a behavior subject by taking a callback that takes the old value and returns the new value
 *
 * @export
 * @template T
 * @param {BehaviorSubject<T>} subj
 * @param {(old: T) => T} cb
 * @returns {T) => void}
 */
export function updateBehaviorSubject<T>(
  subj: BehaviorSubject<T>,
  cb: (old: T) => T,
) {
  subj.next(cb(subj.getValue()));
}
