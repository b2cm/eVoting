import { BehaviorSubject } from 'rxjs';

export function updateBehaviorSubject<T>(
  subj: BehaviorSubject<T>,
  cb: (old: T) => T,
) {
  subj.next(cb(subj.getValue()));
}

