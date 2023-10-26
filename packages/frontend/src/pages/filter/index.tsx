import React, { useState } from "react";

export default function Filter() {
  // this is the page for getting results back

  // "sessionID": "a5a8f33a-3156-4ab9-bb1a-40e3b21f8e06",
  // "partyID": "13efd778-d36c-4244-a9d3-b6f41b62e316",
  // "priv_key": "38dd9f32972d91811bad70c2549e4ca69c79979f5af2ac2367c98e1f3d4c223"
  const [sessionID, setSessionID] = useState("");
  const [partyID, setPartyID] = useState("");
  const [priv_key, setPrivKey] = useState("");

  const [result, setResult] = useState({ partyID: "", votes: [] });

  const [isFetching, setIsFetching] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsFetching(true);
    // Make the POST request to the server
    try {
      const response = await fetch("http://localhost:5000/getResults/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionID, partyID, priv_key }),
      });

      const data = await response.json();
      await setResult(data.data);
      if (response.ok) {
        // Update the content on the page
        console.log("Form submitted successfully!");
      } else {
        console.error("Form submission failed.");
      }
    } catch (error) {
      console.error("An error occurred during form submission:", error);
    }
    setIsFetching(false);
  };

  const Results = () => (
    <div>
      <p>PartyID: {result.partyID}</p>
      <p>
        Votes: <br></br>
        {result.votes.map((vote: any, i: any) => {
          return (
            <span key={i}>
              {" "}
              {i}:{vote} <br></br>{" "}
            </span>
          );
        })}
      </p>
      <p>--------------------------</p>
    </div>
  );

  return (
    <div>
      <h1 className="filter_h1">Filter Page </h1>

      <form onSubmit={handleSubmit}>
        <fieldset disabled={isFetching}>
          <div>
            <label htmlFor="sessionID">Session ID:</label>
            <input
              type="text"
              id="sessionID"
              value={sessionID}
              onChange={(e) => setSessionID(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="partyID">Party ID:</label>
            <input
              type="text"
              id="partyID"
              value={partyID}
              onChange={(e) => setPartyID(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="priv_key">Private ID:</label>
            <input
              type="text"
              id="priv_key"
              value={priv_key}
              onChange={(e) => setPrivKey(e.target.value)}
              required
            />
          </div>

          <button
            className={isFetching ? "disabled_button" : "button"}
            type="submit"
          >
            Get Results
          </button>
        </fieldset>
      </form>
      <br />
      <br />
      {result.partyID && result.votes ? <Results /> : null}
    </div>
  );
}
