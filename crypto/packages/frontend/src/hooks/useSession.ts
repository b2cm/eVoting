import { combineLatest, EMPTY, map, startWith, switchMap } from "rxjs";
import { useObservable } from "rxjs-hooks";
import { Session } from "../connections/session";

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
              p.ready$.pipe(
                startWith(false),
                map((ready) => ({
                  ...p,
                  ready,
                }))
              )
            )
          )
        )
      );
    },
    [] as { partyId: string; ready: boolean }[],
    [session]
  );

  return [userId, parties] as const;
}
