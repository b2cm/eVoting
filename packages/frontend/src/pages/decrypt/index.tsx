import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Parties } from "../../components/parties";
import {
  DecryptSession,
  joinDecryptSession,
  readKeys,
  Tally,
} from "../../connections/session";
import { useSession } from "../../hooks/useSession";
import { useForm } from "react-hook-form";
import { useObservable } from "rxjs-hooks";
import { EMPTY, map, switchMap } from "rxjs";
import { decodeVotes } from "../../util/decode";
import { BACKEND_URL } from "../../connections/api";
import axios from "axios";

export interface Keys {
  userId: string;
  delta: string;
  theta: string;
  vk: string;
  fi: string;
  vki: string;
}
interface CounterObject {
  counter: string;
}

interface Vote {
  vote: string;
}

interface FilterOneResponse {
  filteredData: Vote[];
  filteredCounters: string;
}

export default function Decrypt() {
  const { sessionId } = useParams();
  const { register, setValue, handleSubmit, getValues } = useForm<Keys>();
  const [session, setSession] = useState(null as null | DecryptSession);
  const [_, parties] = useSession(session);
  const [decryptedCounters, setDecryptedCounters] = useState<any>(null);
  const [results, setResults] = useState(
    null as null | { yes: number; no: number; unknown: number }[]
  );

  useEffect(() => {
    if (sessionId) {
      const k = readKeys(sessionId);
      if (k) {
        setValue("theta", k.theta.toString());
        setValue("delta", k.delta.toString());
        setValue("vk", k.vk.toString());
      }
    }
  }, [sessionId, setValue]);

  const tally = useObservable(
    (i, session$) => session$.pipe(switchMap(([s]) => (s ? s.tally$ : EMPTY))),
    null as null | bigint[],
    [session]
  );

  useEffect(() => {
    if (tally) {
      const encodings = tally.map((bigInt) => bigInt.toString(2));
      setResults(decodeVotes(encodings));
    }
  }, [tally]);

  const voteData = useObservable(
    (i, session$) =>
      session$.pipe(
        switchMap(([s]) => (s ? s.voteData$ : EMPTY)),
        map((votes) => {
          // * map ki type //
          const voteMap = new Map<
            bigint,
            {
              y0: bigint;
              vote: bigint;
              zkp: boolean;
              signature: boolean;
              token: string;
            }[]
          >();

          // * iterting through votes
          for (const vote of votes) {
            // getting data from each vote
            const data = {
              token: vote.token,
              y0: vote.y0,
              vote: vote.vote,
              zkp: vote.zkp,
              signature: vote.signature,
            };
            if (voteMap.has(data.y0)) {
              voteMap.get(data.y0)?.push(data);
            } else {
              voteMap.set(vote.y0, [data]);
            }
          }

          // * converting map to array
          let i = 0;
          console.log("voteMap", voteMap.size);
          const res = Array(voteMap.size) as [
            bigint,
            {
              y0: bigint;
              vote: bigint;
              zkp: boolean;
              signature: boolean;
              token: string;
            }[]
          ][];

          for (const entry of voteMap.entries()) {
            res[i] = entry;
            console.log("entry", entry);
            i++;
          }
          return res;
        })
      ),

    // *next parameter
    [] as [
      bigint,
      {
        y0: bigint;
        vote: bigint;
        zkp: boolean;
        signature: boolean;
        token: string;
      }[]
    ][],
    [session]
  );

  useEffect(() => {
    // if votes not fetched yet return
    if (!voteData) return;

    const fetchData = async () => {
      const {
        data: { filteredCounters },
      } = await axios.get<any>(BACKEND_URL + "/Vote/FilterOne");
      console.log("filteredCounters", filteredCounters);
      console.log("typeof filteredCounters", typeof filteredCounters);
      const counterStrings = filteredCounters.map(
        (counterObject: { counter: any }) => counterObject.counter
      );

      setDecryptedCounters(counterStrings);
    };

    fetchData();
  }, [voteData]);

  const [alwaysTrue, setAlwaysTrue] = useState(true);
  const startSes = ({ userId, delta, theta, vk, fi, vki }: Keys) => {
    const cb = async () => {
      if (session) {
        session.cleanup();
        setSession(null);
      }

      const s = await joinDecryptSession(
        sessionId!,
        userId,
        BigInt(delta),
        BigInt(theta),
        BigInt(vk),
        BigInt(fi),
        BigInt(vki)
      );

      setSession(s);
    };

    cb();
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-3xl font-semibold">Decrypt Votes</h2>
      <div className="flex space-x-32 items-center">
        <div>
          <h3 className="text-lg font-semibold">Input Decryption Keys</h3>
          <form className="space-y-1" onSubmit={handleSubmit(startSes)}>
            <div>
              <label>User Id: </label>
              <br />
              <input {...register("userId")} />
            </div>
            <div>
              <label>theta: </label>
              <br />
              <input {...register("theta")} />
            </div>
            <div>
              <label>delta: </label>
              <br />
              <input {...register("delta")} />
            </div>
            <div>
              <label>vk: </label>
              <br />
              <input {...register("vk")} />
            </div>
            <div>
              <label>fi: </label>
              <br />
              <input {...register("fi")} />
            </div>
            <div>
              <label>vki: </label>
              <br />
              <input {...register("vki")} />
            </div>
            <input
              type="submit"
              className="block blue-btn ripple"
              value="Start"
            />
          </form>
        </div>
        <div className="space-y-4">
          {/* {alwaysTrue ? (
            decryptedCounters?.map((counterObject:any, index:any) => (
              <div key={index}>
                <p>
                  {index} : {counterObject.toString()}
                </p>
              </div>
            ))
          ) : (
            <></>
          )} */}

          <button
            onClick={() => {
              session?.ready(true);
            }}
            className="block blue-btn ripple"
          >
            Ready
          </button>
          <Parties userId={getValues().userId} parties={parties} />

          {results ? (
            <div>
              <h4>Results:</h4>
              <table>
                <thead>
                  <tr>
                    <th>Question Number</th>
                    <th>Yes</th>
                    <th>No</th>
                    <th>Unknown</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{result.yes}</td>
                      <td>{result.no}</td>
                      <td>{result.unknown}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div>
                <h4>Decrypted-Counters:</h4>

                {decryptedCounters?.map((counterObject: any, index: any) => (
                  <div key={index}>
                    <p>
                      {index} : {counterObject.toString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div>
        <h2 className="text-3xl font-semibold">Votes</h2>
        <h3> sessionId: {sessionId} </h3>
        <table className="table">
          <thead>
            <tr>
              <th>Vote Data</th>
              <th>Signature Valid</th>
              <th>ZKP Valid</th>
            </tr>
          </thead>

          <tbody>
            {voteData && console.log("vd", voteData)}

            {voteData?.map(([y0, votes], voterNumber) =>
              votes.map(
                (vote, index) => (
                  console.log("index:", index, "\n", "vote ", vote),
                  (
                    <tr key={vote.vote.toString()}>
                      <td> {vote.vote.toString()} </td>
                      <td> {vote.signature.toString()} </td>
                      <td> {vote.zkp.toString()} </td>
                    </tr>
                  )
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
