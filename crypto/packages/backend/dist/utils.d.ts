import { BehaviorSubject } from 'rxjs';
export declare function updateBehaviorSubject<T>(subj: BehaviorSubject<T>, cb: (old: T) => T): void;
