import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { EncryptSession, joinEncryptSession } from "../../connections/session";
import { GeneratedKeys } from "pallier";
import { BACKEND_URL } from "../../connections/api";
import { useSession } from "../../hooks/useSession";
import { Parties } from "../../components/parties";
import { useObservable } from "rxjs-hooks";
import { EMPTY, switchMap } from "rxjs";
import { HashedIds } from "../../util/leaves";
import { GenerateRandom, GenPublicKey } from "elgammal";

export default function GeneratePage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null as null | EncryptSession);
  const [Party_vid, SetParty_vid] = useState(null as null | string);
  const [Party_counterlimit, SetParty_counterlimit] = useState(
    null as null | string
  );
 

  const [delay, setDelay] = useState(1000);
  const [message, SetMessage] = useState("");
  const [complete, SetComplete] = useState(false);
  //If sessionId was not provided, we create a new sessionId
  useEffect(() => {
    if (!sessionId) {
      createSession().then((id) =>
        navigate("/generate/" + id, { replace: true })
      );
    }
  }, [sessionId, navigate]);

  const [TallyKeyPub, SetTallyKeyPub] = useState(null as null | string);
  const [TallyKeyPriv, SetTallyKeyPriv] = useState(null as null | string);

  async function createTallyKey() {
    const priv_key = GenerateRandom();
    const pubkey = GenPublicKey(priv_key);
    await axios.post(BACKEND_URL + "/Submitkey", {
      userId,
      pubKey: pubkey.compressed.toString(16),
      sessionId: sessionId,
    });
    SetTallyKeyPub(pubkey.compressed.toString(16));
    SetTallyKeyPriv(priv_key.toString(16));
  }



  useEffect(() => {
    const cb = async () => {
      try {
        if (!session && sessionId) {
          console.log("creating session");
          const s = await joinEncryptSession(sessionId);
          setSession(s);
        }
      } catch (e) {
        console.error(e);
      }
    };

    cb();

    return () => {
      if (session) {
        session.cleanup();
      }
    };
  }, [sessionId, session]);

  const [userId, parties] = useSession(session);

  const WaitForLimit = async () => {
    return new Promise((resolve, reject) => {
      const myInter = setInterval(async function getUserData() {
        try {
          const {
            data: { result },
          } = await axios.get(BACKEND_URL + "/TriggerVal");
          console.log("result", result);
          if (result == 1) {
            clearInterval(myInter);
            resolve("done");
          }
          // ? else setinterval will call this again ?
        } catch (error) {
          console.log(error);
          reject(error);
        }
      }, 1000);
    });
  };

  const keys = useObservable(
    (i, session$) =>
      session$.pipe(switchMap(([s]) => (s ? s.generatedKeys$ : EMPTY))),
    null as null | GeneratedKeys,
    [session]
  );


  useEffect(() => {
    //console.log("partyselection");
    const allPartyIDs = parties.map((party) => party.partyId);
    if (userId != null) {
      allPartyIDs.push(userId);
    }
    //console.log(allPartyIDs);
    allPartyIDs.sort((n1, n2) => {
      if (n1 > n2) {
        return 1;
      }

      if (n1 < n2) {
        return -1;
      }

      return 0;
    });

    if (keys) {
      {
        console.log("selecting party", allPartyIDs);
        SetParty_vid(allPartyIDs[0]);
        SetParty_counterlimit(allPartyIDs[1]);
        SetComplete(true);
      }
    }
    console.log("just checking");
  }, [keys]);


  const FetchlimitsandGenerateCounters = async () => {
    const {
      data: { limits, HashIds },
    } = await axios.get(BACKEND_URL + "/getCounterlimit");
    console.log("result from limits");
    console.log("limits", limits);
    console.log("HashIds", HashIds);

    // * generate the tokens
    const tokens: any[] = [];
    for (let i = 0; i < HashIds.length; i++) {
      const vid = GenerateRandom();
      let counter = BigInt(Math.floor(Math.random() * 10000000).toString(10));
      for (let j = 0; j < limits[j]; j++) {
        // * for every hash id generate limit number of counters
        counter += 1n;
        tokens.push({
          vid: vid.toString(),
          counter: counter.toString(),
          HashedId: HashIds[i],
        });
      }
    }
    // console.log("tokens", tokens);
    await postTokens(tokens);
  };

  
  const postTokens = async (tokens: any[]) => {
    let promises = [];
    for (let i = 0; i < tokens.length; i++) {
      promises.push(
        axios.post(BACKEND_URL + "/StoreTokens", {
          vid: tokens[i].vid,
          HashedId: tokens[i].HashedId,
          counter: tokens[i].counter,
        })
      );
    }
    Promise.all([promises]).then((res) => {
      console.log("tokens result ", res);
    });
  };

  useEffect(() => {
    if (!keys) return;
    //  Party for generating Counter limit
    if (userId && userId == Party_counterlimit) {
      console.log("I am the counterlimit party");

      const generateLimits = async () => {
        let limits: { Limit: number; HashedId: string }[] = [];
        HashedIds.forEach((element) => {
          const limit = Math.floor(Math.random() * (8 - 5 + 1) + 5);
          limits.push({ Limit: limit, HashedId: element });
        });
        // Post the limit to the backend
        console.log(limits);
        let promises = [];
        for (let i = 0; i < limits.length; i++) {
          promises.push(
            axios.post(BACKEND_URL + "/counterlimit", {
              limit: limits[i].Limit,
              HashedId: limits[i].HashedId,
            })
          );
        }
        Promise.all(promises).then((res) => {
          console.log(res);
        });

        await axios.post(BACKEND_URL + "/SetTriggerVal", { flag: 1 });
        SetMessage("limits generated");
      };
      generateLimits();
    }
    // Party for generating VoterIds & Counter
    else if (userId === Party_vid) {
      console.log("I am the vid party");
      // * Post the tokens to the backend

      const waitandgenerate = async () => {
        SetMessage("waiting for limits");
        await WaitForLimit();
        await FetchlimitsandGenerateCounters();
        SetMessage("Generated vids");
      };

      waitandgenerate();

      // * get the limits from the backend
      //FetchlimitsandGenerateCounters();
      // SetMessage("vids generated");
    } else if (userId != null) {
      // parties that do nothing
      SetMessage("");
    }
  }, [complete]);

  useEffect(() => {
    if(!userId) return;
    const cb = async () => {
      try {
        if (!TallyKeyPub && !TallyKeyPriv) {
          //console.log("creating TallyKey");
          const TallyKey = await createTallyKey();
          console.log("tally key ", TallyKey);
        }
      } catch (e) {
        console.error(e);
      }
    };
    cb();
  }, [userId]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-3xl font-semibold">Generate Public Key</h2>
      <br />
      {sessionId ? (
        <span>
          Session Link:{" "}
          <span className="border border-blue-300 rounded-md py-5 px-4">
            {"localhost:3000/generate/" + sessionId}
          </span>
        </span>
      ) : (
        <></>
      )}
      <br />

      {userId ? <Parties userId={userId} parties={parties} /> : <></>}

      {TallyKeyPub && (
        <>
          <div className="flex space-x-2"> My TS Public key: {TallyKeyPub}</div>
          <div className="flex space-x-2"> My TS priv key: {TallyKeyPriv}</div>
        </>
      )}

      <button
        className="block blue-btn ripple"
        onClick={() => session?.ready(!session.isReady)}
      >
        Start Key Generation
      </button>

      {keys ? (
        <>
          <div className="rounded-md text-center bg-blue-200 px-2 py-2">
            <h3 className="text-xl font-medium">Generated Keys</h3>
            <h4 className="text-lg font-semibold">Public</h4>
            <div>N: {keys.public.N.toString()}</div>
            <div>Theta: {keys.public.theta.toString()}</div>
            <div>Delta: {keys.public.delta.toString()}</div>
            <div>Vk: {keys.public.vk.toString()}</div>
            <h4 className="text-lg font-semibold">Private</h4>
            <div>f: {keys.private.f.toString()}</div>
            <div>Vki: {keys.private.vki.toString()}</div>
            <h5 className="text-lg font-semibold">Selected Parties </h5>
            <p> For Counter_limit : {Party_counterlimit} </p>
            <p> For Token generation : {Party_vid}</p>
          </div>
          <div className="rounded-md text-center bg-blue-200 px-2 py-2">
            
            {message}
          </div>
        </>
      ) : (
        //
        <></>
      )}
    </div>
  );
}

async function createSession() {
  const {
    data: { sessionId: id },
  } = await axios.post(BACKEND_URL + "/CreateSession");
  return id as string;
}
