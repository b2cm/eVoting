import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAndVerifyVotes, GetLookUpTable } from "../../connections/session";

export default function Electionres() {
  const [voterData, setVoterData] = useState(
    null as
      | null
      | [
          bigint,
          {
            y0: bigint;
            vote: bigint;
            zkp: boolean;
            signature: boolean;
            // voterID: string;
            // counter: string;
            token: string;
          }[]
        ][]
  );

  const [allTokens, setAllTokens] = useState([]);

  useEffect(() => {
    if (!voterData) return;

    const allTokens = voterData.forEach((entry) => {
      entry.forEach((vote) => {
        console.log(vote);
      });
    });
  }, [voterData]);

  const { sessionId } = useParams();

  const [lookupTable, setLookupTable] = useState(
    null as null | { value: string; point: string }[]
  );

  useEffect(() => {
    const cb = async () => {
      if (sessionId) {
        const { voteVerification } = await getAndVerifyVotes(sessionId ,1);

        const voteMap = new Map<
          bigint,
          {
            y0: bigint;
            vote: bigint;
            zkp: boolean;
            signature: boolean;
            // voterID: string;
            // counter: string;
            token: string;
          }[]
        >();
        for (const vote of voteVerification) {
          const data = {
            //  voterID: vote.voterID,
            //  counter: vote.counter,
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
        let i = 0;
        const res = Array(voteMap.size) as [
          bigint,
          {
            y0: bigint;
            vote: bigint;
            zkp: boolean;
            signature: boolean;
            // voterID: string;
            //  counter: string;
            token: string;
          }[]
        ][];
        for (const entry of voteMap.entries()) {
          res[i] = entry;

          i++;
        }
        setVoterData(res);
      }
    };

    const cb2 = async () => {
      setLookupTable(await GetLookUpTable());
    };

    cb();
    cb2();
  }, []);

  return (
    <div>
      <div> Election Page </div>

      {/*Table*/}

      <div> Session ID = {sessionId} </div>
      <table className="table">
        <thead>
          <tr>
          
            <th>Token</th>
        
            <th>Vote Data</th>
            <th>Signature Valid</th>
            <th>ZKP Valid</th>
          </tr>
        </thead>

        <tbody>
          {voterData?.map(([y0, votes], voterNumber) =>
            votes.map((vote, index) => {
              const token = JSON.parse(vote.token);
              console.log("token--", token);
              return (
                <tr key={vote.vote.toString()}>
             
                
                  <td>
                    <div>
                      {token.map(
                        (item: {
                          vid: string;
                          counter: string;
                          partyId: string;
                        }) => {
                          return (
                            <>
                              <div>Vid::{item.vid}</div>
                           
                              <div>Counter:: {item.counter} </div>
                          
                              <div> Party:{item.partyId} </div>{" "}
                              <br></br>
                            </>
                          );
                        }
                      )}
                    </div>
                  </td>
                  <td> {vote.vote.toString(16)} </td>
                  <td> {vote.signature.toString()} </td>
                  <td> {vote.zkp.toString()} </td>
                </tr>
              
              );
            })
          )}
        </tbody>
      </table>

      {lookupTable && (
        <>
          <div>LookUpTable</div>
          <table>
            <thead>
              <tr>
                <th>Point</th>
                <th>Value</th>
              </tr>
            </thead>

            <tbody>
              {lookupTable.map((row) => (
                <tr>
                  <td>{row.point}</td>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
