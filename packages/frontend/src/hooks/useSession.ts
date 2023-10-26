import { combineLatest, EMPTY, map, startWith, switchMap } from "rxjs";
import { useObservable } from "rxjs-hooks";
import { Session } from "../connections/session";

/**
 *
 *
 * @export
 * @param {(Session | null)} session
 * @returns {readonly [any, any]}
 */
export function useSession(session: Session | null) {
  const userId = useObservable(
    (i, session$) => {
      return session$.pipe(switchMap(([s]) => (s ? s.userId$ : EMPTY)));
    },
    null as null | string,
    [session]
  );

  const parties = useObservable(
    (i, session$) => {
      return session$.pipe(
        switchMap(([s]) => (s ? s.parties$ : EMPTY)),
        switchMap((ps) =>
          combineLatest(
            ps.map((p) =>
              combineLatest([p.ready$.pipe(startWith(false)), p.vrf$]).pipe(
                map(([ready, vrf]) => ({
                  ...p,
                  ready,
                  vrf,
                }))
              )
            )
          )
        )
      );
    },
    [] as { vrf: any; partyId: string; ready: boolean }[],
    [session]
  );

  return [userId, parties] as const;
}
