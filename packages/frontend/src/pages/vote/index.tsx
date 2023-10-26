import { useCallback, useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useParams } from "react-router-dom";
import { createMemberShipZKP } from "pallier";
import { BACKEND_URL } from "../../connections/api";
import { KeyPair, signData, verifyKeyPair } from "lrs";
import { useForm } from "react-hook-form";
import { Groups } from "../../components/groups";
import BigInteger from "big-integer";
import {
  Point,
  GenerateRandom,
  GenPublicKey,
  signature,
  ElgammalEncrypt,
  CURVE,
  verifySignature,
} from "elgammal";
import messagePossibilities from "../../util/possibilities";
/**
 *
 *
 * @export
 * @return {*}
 */

export default function Vote() {
  const { sessionId } = useParams();

  const {
    register,
    getValues,
    formState: { errors, isValid },
    trigger,
  } = useForm({
    mode: "onBlur",
  });

  const [groups, setGroups] = useState(
    null as null | { [id: string]: bigint[] }
  );

  const [TotalLimit, setTotalLimit] = useState(0);
  const [outofcounter, setoutofcounter] = useState(false);
  const [disableConfirm, setdisableConfirm] = useState(false);
  const [disableConn, setDisableConn] = useState(false);

  // maintaining encoding string

  const [encoding, setEncoding] = useState("");

  /**
   * @description this function is called when the user clicks on the get next button
   * it decreases the counter limit by 1
   * if the counter limit is 0 then it sets the outofcounter to true
   * and sets the current token to null
   *
   *
   * @return {*}
   */
  const decreaseCounterLimit = () => {
    setLimit(Limit - 1);
    if (Limit == 0) {
      setoutofcounter(true);
      setCurrentToken([{ vid: "", counter: "", partyId: "" }]);
      return;
    }
    return;
  };

  const [Limit, setLimit] = useState(0);

  const [voterData, setVoterData] = useState<{
    counter: string[] | null;
    vid: string[] | null;
  } | null>(null);

  const [allTokens, setAllTokens] = useState([]);

  const [currentToken, setCurrentToken] = useState<
    | {
        vid: string;
        counter: string;
        partyId: string;
      }[]
    | null
  >(null);

  /**
   * @description this function is called when the user requestws the next vote
   * it sets the current token to the next token
   */

  useEffect(() => {
    if (!currentToken) return;
    const currentCounters: string[] = [];
    const currentVids: string[] = [];
    currentToken?.forEach((token) => {
      currentCounters.push(token.counter);
      currentVids.push(token.vid);
    });
    setVoterData({
      counter: currentCounters,
      vid: currentVids,
    });
  }, [currentToken]);

  /**
   *
   * @description this function is called when the user clicks on the connect to party button
   * it gets the voter data from the backend and sets the current token to the first token
   * and sets the total limit and limit to the length of the tokens array
   *
   * @returns
   */

  const getVoterData = async () => {
    if (!isValid) return;
    // here the call will be made to the backend to get the voter data corresponding to the public key
    console.log("sessionID", sessionId);
    const {
      data: { tokens },
    } = await axios.post(BACKEND_URL + "/Vote/Voter/" + getValues().publicKey, {
      sessionId: sessionId,
    });
    setCurrentToken(tokens[0]);
    setTotalLimit(tokens.length);
    setLimit(tokens.length);
    console.log("tokens", tokens, "\n");
    setAllTokens(tokens);
    setDisableConn(true);
  };

  /**
   *
   * o
   *
   */
  useEffect(() => {
    const cb = async () => {
      const {
        data: { candidates: cand, pubKey },
      } = await axios.get(BACKEND_URL + "/SessionData/" + sessionId);
      setCand(
        cand.map((c: any) => ({
          title: c.title,
          message: BigInt("0x" + c.message),
        }))
      );
      setPub(BigInt("0x" + pubKey));
    };

    const cb2 = async () => {
      let { data } = await axios.get<
        any,
        AxiosResponse<{ [id: string]: any[] }>
      >(BACKEND_URL + "/Vote/Voter");

      for (const id in data) {
        data[id] = data[id].map((s) => BigInt("0x" + s));
      }

      setGroups(data);
    };

    cb();
    cb2();
  }, [sessionId]);

  const [selected, setSelected] = useState(null as null | number);
  const [candidates, setCand] = useState(
    [] as Array<{ title: string; message: bigint }>
  );
  const [pub, setPub] = useState(null as null | bigint);

  /**
   * @description this function is called when the user clicks on the confirm button
   * it encrypts the message and sends it to the backend
   * Stores the vote in the databaseq
    @returns {Promise<void>}
  */

  const encryptAndSend = useCallback(async () => {
    const pubKey = getValues().publicKey;
    const privKey = getValues().privateKey;
    if (
      selected == null ||
      !groups ||
      !pub ||
      !pubKey ||
      !privKey ||
      !voterData
    ) {
      return null;
    }
    if (pubKey.trim() == "" || privKey.trim() == "") {
      return;
    }

    const possibilities = messagePossibilities();
    // convert encoding to bigint
    const encodingBigInt = BigInt("0b" + encoding);
    console.log("encodingBigInt", encodingBigInt.toString(2));

    const [c, proof] = createMemberShipZKP(encodingBigInt, possibilities, pub);
    console.log("votecipher", c);
    const publicKey = BigInteger(pubKey.trim(), 16);
    const privateKey = BigInteger(privKey.trim(), 16);

    //find our group
    const g = Object.entries(groups).find(([, keys]) =>
      keys.some((k) => BigInteger(k).compare(publicKey) == 0)
    );

    if (!g) {
      return;
    }

    const signature = signData(
      g[1].map((n) => BigInteger(n)),
      new KeyPair({ value0: publicKey, value1: privateKey }),
      c
    );

    //! here is where it goes
    await axios.post(BACKEND_URL + "/Vote", {
      sessionId,
      ciphertext: c.toString(16),
      proof: proof.map((p) => p.map((v) => v.toString(16))),
      signature,
      groupId: g[0],
      token: JSON.stringify(currentToken),
    });

    setAllQuesAnswered(false);
    setEncoding("");
    setQuesLimit(4);
  }, [pub, selected, candidates, sessionId, currentToken, encoding]);

  const [tokenIndex, setTokenIndex] = useState(0);

  /**
   *  @description  this function is called when the user clicks on the get next button
   * it increases the token index by 1 and sets the current token to the next token
   * @return {*}
   */
  const updateToken = () => {
    if (tokenIndex >= allTokens.length - 1) return;
    setTokenIndex(tokenIndex + 1);
    setCurrentToken(allTokens[tokenIndex + 1]);
    setdisableConfirm(false);
  };

  const [allQuesAnswered, setAllQuesAnswered] = useState(false);

  const [quesLimit, setQuesLimit] = useState(4);

  /**
   * @description this function is called when the user clicks on the verify signature button
   * it gets the encrypted tokens from the backend and verifies the signature
   *
   * @returns {Promise<bool>}
   */
  const verifySign = async () => {
    const pubkey = getValues().publicKey;
    console.log("pubkey", pubkey);
    const { data } = await axios.post(
      BACKEND_URL + "/Vote/getEncryptedTokens",
      {
        publicKey: pubkey,
      }
    );

    console.log("data", data);

    const verificationSignature = JSON.parse(data[0].signature.toString());

    console.log("verificationSignature", verificationSignature);
    const { R, s, e } = verificationSignature;
    const bool = verifySignature(
      BigInt(s),
      Point.fromCompressed(BigInt("0x" + R)),
      BigInt(e),
      Point.fromCompressed(BigInt("0x" + pubkey))
    );
    console.log("bool", bool);
    window.alert("Signature Verified");
  };

  /**
   * @description this function is called when the user clicks on the submit button
   * all the encoding strings are appended to the encoding string
   * */
  useEffect(() => {
    console.log("encodingchanged", encoding);
  }, [encoding]);

  const appendToEncoding = (str: string) => {
    if (str.includes("2")) {
      console.log("str 010");
      setEncoding(encoding + "010");
    } else if (str.includes("1")) {
      console.log("str 100");
      setEncoding(encoding + "100");
    } else if (str.includes("3")) {
      console.log("str 001");
      setEncoding(encoding + "001");
    }
    console.log("encoding", encoding);
  };

  const [disableSubmit, setDisableSubmit] = useState(false);

  /**
   * @description this function is called when the user clicks on the submit button
   * it decreases the question limit by 1
   * if the question limit is 0 then it sets the allQuesAnswered to true
   *
   *
   * @return {*}
   */
  function decreaseQuesLimit() {
    if (quesLimit == 1) {
      setAllQuesAnswered(true);
      setDisableSubmit(true);
      return;
    }

    setQuesLimit(quesLimit - 1);
    console.log("quesLimit", quesLimit);

    return;
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <header className="text-center text-2xl py-4 font-semibold">
        Cast Your Vote:{" "}
      </header>
      <form>
        <div>
          <label>Public Key </label>
          <br />
          <input
            className={errors?.publicKey ? "border-red-600" : "border-black"}
            {...register("publicKey", {
              onBlur: () => {
                trigger();
              },
              required: "Public Key Required",
              validate: {
                matching: (v) => {
                  try {
                    const valid =
                      errors?.privateKey ||
                      verifyKeyPair(
                        BigInt("0x" + getValues().privateKey),
                        BigInt("0x" + v)
                      );
                    if (valid) {
                      return valid;
                    }
                    throw new Error();
                  } catch (e) {
                    return "Public Key does not match private key";
                  }
                },
                registered: (v) =>
                  !groups ||
                  Object.entries(groups).some(([, group]) =>
                    group.some((k) => k == BigInt("0x" + v))
                  ) ||
                  "Public Key not registered",
              },
            })}
          />
          {errors?.publicKey && (
            <div className="text-red-600 text-sm">
              {errors.publicKey.message}
            </div>
          )}
        </div>

        <div>
          <label>Private Key </label>
          <br />
          <input
            className={errors?.privateKey ? "border-red-600" : "border-black"}
            {...register("privateKey", {
              required: "Private Key Required",
              onBlur: () => {
                trigger();
              },
            })}
          />
          {errors?.privateKey && (
            <div className="text-red-600 text-sm">
              {errors?.privateKey.message}
            </div>
          )}
        </div>
      </form>
      <div>
        <button
          onClick={() => getVoterData()}
          className="blue-btn ripple"
          disabled={disableConn}
        >
          Connect to Party
        </button>
        <button onClick={() => verifySign()} className="blue-btn ripple">
          Verify Signature
        </button>
        <div>
          <button
            onClick={() => updateToken()}
            className="blue-btn ripple"
            disabled={outofcounter}
          >
            Get Next
          </button>
        </div>
        <div> Total Limit : {TotalLimit}</div>
        <div> Remaining Limit : {Limit}</div>
        {voterData && (
          <div>
            <div className="text-center text-2xl py-4 font-semibold"> VID:</div>

            <div>
              {" "}
              <ul>
                {voterData?.vid!.map((id) => (
                  <li key={id}>{id}</li>
                ))}
              </ul>
            </div>
            <div className="text-center text-2xl py-4 font-semibold">
              {" "}
              Counter:{" "}
            </div>
            <div>
              {" "}
              <ul>
                {voterData?.counter!.map((counter) => (
                  <li key={counter}>{counter}</li>
                ))}
              </ul>{" "}
            </div>
          </div>
        )}
      </div>
      {/* this is candidates mapping */}
      <div className="flex justify-center space-x-4">
        {candidates.map((c, i) => (
          <div
            className={[
              "cursor-pointer w-44 h-56 transform hover:scale-105 hover:shadow-lg text-center transition-transform border border-blue-300 flex flex-col justify-center items-center space-y-2",
              ...(i === selected
                ? ["scale-105", "border-blue-500", "shadow-md"]
                : []),
            ].join(" ")}
            key={i}
            onClick={() => {
              setSelected(i);
            }}
          >
            <img alt="Candidate" src="/silhoutte.png" className="w-3/4" />
            {i === 0 ? "Ja" : i === 1 ? "Nein" : i === 2 ? "Enthaltung" : ""}
          </div>
        ))}
      </div>
      {selected != null ? (
        <>
          <div className="text-center">
            Selected: {candidates[selected].title}
          </div>

          <button
            onClick={() => {
              console.log("button clicked");
              console.log(encoding);
              encryptAndSend();
              decreaseCounterLimit();
              setdisableConfirm(true);
            }}
            className={
              "blue-btn ripple" +
              (allQuesAnswered ? "" : " opacity-30 cursor-default")
            }
            disabled={
              !isValid || !voterData || outofcounter || !allQuesAnswered
            }
          >
            Confirm
          </button>

          <button
            onClick={() => {
              // get selected candidate and pass to appendToEncoding
              const selectedCandidate = candidates[selected].title;
              appendToEncoding(selectedCandidate);
              decreaseQuesLimit();
            }}
            className={"blue-btn ripple"}
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
