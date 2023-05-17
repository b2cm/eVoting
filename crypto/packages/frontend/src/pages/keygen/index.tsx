import axios, { AxiosResponse } from "axios";
import { generatePair, KeyPair } from "lrs";
import { useCallback, useState } from "react";
import { Groups } from "../../components/groups";
import { BACKEND_URL } from "../../connections/api";
import { HashedIds } from "../../util/leaves";

export default function KeyGen() {
  const [pair, setPair] = useState(null as null | KeyPair);
  const [HashedID, setHashedID] = useState(null as null | string);
  const [buttonEnable, setButtonEnable] = useState(true);
  const [error, setError] = useState("");

  const [groups, setGroups] = useState(
    null as null | { [id: string]: bigint[] }
  );

  const generate = useCallback(() => {
    setPair(generatePair());
  }, []);

  const submit = useCallback(() => {
    const cb = async () => {
      if (!pair) {
        return;
      }
      let { data } = await axios.post<
        any,
        AxiosResponse<{ [id: string]: any[] }>
      >(BACKEND_URL + "/Vote/Voter", {
        pubKey: pair.publicKey.toString(16),
      });
      for (const id in data) {
        data[id] = data[id].map((s) => BigInt("0x" + s));
      }
      setGroups(data);
    };

    const cb2 = async () => {
      if (!pair) {
        return;
      }
      // send hashedID to backend
      await axios.post(BACKEND_URL + "/Vote/HashedId", {
        pubKey: pair.publicKey.toString(16),
        hashedId: HashedID,
      });
    };

    cb();
    cb2();
  }, [pair]);

  const handlechange = useCallback((e) => {
    const inputHash = e.target.value;

    if (HashedIds.includes(inputHash)) {
      setError("");
      setHashedID(inputHash);
      setButtonEnable(false);
    } else {
      setError("HashedID is not valid");
    }
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-3xl font-semibold">Submit HashedID</h1>
      <input
        type="text"
        id="fname"
        name="HashedId"
        onChange={handlechange}
      ></input>
      <div className="err">{error}</div>

      <h2 className="text-3xl font-semibold">Generate Key Pair</h2>

      <button className="block blue-btn ripple" onClick={generate}>
        Generate Key
      </button>

      {pair ? (
        <>
          <h3 className="text-2xl font-semibold">Key Pair:</h3>
          <h4 className="text-xl font-semibold">Public Key:</h4>

          <span className="px-2 py-2 border rounded-md border-blue-500 break-all mx-5">
            {pair.publicKey.toString(16)}
          </span>

          <h4 className="text-xl font-semibold">Private Key:</h4>
          <span className="px-2 py-2 border rounded-md border-blue-500 break-all mx-5">
            {pair.privateKey.toString(16)}
          </span>

          <button
            disabled={buttonEnable}
            onClick={submit}
            className="block blue-btn ripple"
          >
            Submit
          </button>
        </>
      ) : (
        <></>
      )}

      {groups ? <Groups groups={groups} /> : <></>}
    </div>
  );
}
