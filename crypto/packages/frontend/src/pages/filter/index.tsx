import axios from "axios";
import React, { useEffect } from "react";
import { useState } from "react";
import { BACKEND_URL } from "../../connections/api";

export default function Filter() {
  // this is the page for getting results back

  const [filter, setFilter] = useState(null);
  const [results, setResults] = useState(null as null | any[]);

  useEffect(() => {
    // * this is where we will get the data from the backend
    const cb = async () => {
      const data = await axios.get(BACKEND_URL + "/Vote/FilterVotes");
      console.log("data ", data.data);

      setResults(data.data);
    };

    cb();
  }, []);

  useEffect(() => {
    if (!results) return;
    console.log("results ", results);
  }, [results]);

  return (
    <div>
      <h1>Filter Page </h1>

      {results &&
        results.map((result, index) => {
          const votes = JSON.parse(result.votes);
          return (
            <div key={index}>
              <p>PartyID: {result.partyID}</p>

              <p>
                Votes:{" "}
                <br></br>
                {votes.map((vote: any, i: any) => {
                  return <span key={i}> {i}:{vote} <br></br> </span>;
                })}
              </p>
              <p>--------------------------</p>
            </div>
           
          );
        })}
    </div>
  );
}
