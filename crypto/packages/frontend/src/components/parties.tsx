import { useEffect, useState } from "react";

import { GenerateRandom, GenPublicKey } from "elgammal";
import axios from "axios";
import { BACKEND_URL } from "../connections/api";
import { useParams } from "react-router-dom";

export interface PartiesProps {
  parties: { partyId: string; ready: boolean }[];
  userId: string;
}

export function Parties({ parties, userId }: PartiesProps) {
  // const { sessionId } = useParams();

  // const [TallyKeyPub, SetTallyKeyPub] = useState(null as null | string);
  // const [TallyKeyPriv, SetTallyKeyPriv] = useState(null as null | string);

  // useEffect(() => {
  //   const cb = async () => {
  //     try {
  //       if (!TallyKeyPub && !TallyKeyPriv) {
  //         //console.log("creating TallyKey");
  //         const TallyKey = await createTallyKey();
  //         SetTallyKeyPub(TallyKey["publicKey"]);
  //         SetTallyKeyPriv(TallyKey["privateKey"]);
  //         await axios.post(BACKEND_URL + "/Submitkey", {
  //           userId,
  //           pubKey: TallyKey["publicKey"],
  //           sessionId: sessionId,
  //         });
  //       }
  //     } catch (e) {
  //       console.error(e);
  //     }
  //   };
  //   cb();
  // }, []);

  return (
    <div>
      <h3 className="text-xl font-medium">Parties: </h3>
      {userId ? <div>My Id: {userId}</div> : <></>}
    
      <div className="flex space-x-2">
        {parties.map((party) => (
          <div
            className="border border-gray-400 rounded-md py-2 px-2"
            key={party.partyId}
          >
            <div>
              <span className="font-bold text-sm">ID: </span>
              <span className="text-sm">{party.partyId}</span>
            </div>
            <div>{party.ready ? "Ready" : "Not Ready "}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
// function createTallyKey() {
//   const priv_key = GenerateRandom();
//   const pubkey = GenPublicKey(priv_key);
//   return {
//     publicKey: pubkey.compressed.toString(16),
//     privateKey: priv_key.toString(16),
//   };
// }
