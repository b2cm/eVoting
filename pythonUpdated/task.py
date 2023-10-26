# Entry point that will execute the Algorithm

from cgi import test
import pprint
import binascii
import time
import json
import numpy as np
import pandas as pd
import requests as req
from petlib.ec import EcGroup, Bn, EcPt
import random
from itertools import groupby
from operator import itemgetter
from proc.filter import Filter
import primitives.elgamal as elgamal
from primitives.ballot_structure import BallotBundle, VoteVector
import os
import argparse

G = EcGroup(nid=714)
space = print("\n")
infinity = G.infinite()


def EcptTostr(ecpt):
    """Converts an elliptic curve point to a hex string"""
    byte_strr = ecpt.export()
    point_to_str = binascii.hexlify(byte_strr).decode("utf8")
    return point_to_str


def convert_dec_to_bn(vids):
    """Converts a list of decimal numbers to a list of Bn objects"""
    converted_vids = []
    for i in vids:

        converted_vids.append(Bn.from_decimal(i))

    return converted_vids


def EcPt_from_hexstr(str):
    """Converts a hex string to an elliptic curve point"""
    Byteseq = Bn.from_hex(str).binary()
    EllipticCurvePoint = EcPt.from_binary(Byteseq, G)
    return EllipticCurvePoint


def decrypt(priv_key, c1, c2):
    """Decrypts a ciphertext using the private key"""
    return c2 - (priv_key * c1)


def getSecondHalf(string):
    """Returns the second half of a string FROM COMPRESSION"""
    return string[len(string) // 2:]


def getFirstHalf(string):
    """Returns the first half of a string FROM COMPRESSION"""
    return string[: len(string) // 2]


def makeLookUpFromJSON(json):
    """Makes a lookup table from a json file"""

    lookuptable = {}
    for pv in json:

        print("object", type(pv))
        point = "0" + pv["point"]

        value = Bn.from_hex(pv["value"])
        lookuptable[point] = value
    return lookuptable


def LTBforFilter(json):
    """Makes a lookup table from a json file"""
    """ ARGS: JSON FILE FROM SERVER"""
    """ file FORMAT:
    [
        {
            "point": "0x
            "value": "0x
        }, 
        {
            "point": "0x
            "value": "0x
        }]
    """

    lookuptable = {}
    for pv in json:
        print(pv['point'])
        point = EcPt_from_hexstr(pv["point"])
       # pprint.pprint(pv['value'])
        value = Bn.from_hex(pv["value"])
        lookuptable[point] = value
    return lookuptable


def generateBallotsFromJson(pk, new_dict_list):
    """Generates ballots from a json file"""
    """ ARGS: PRIVATE KEY, JSON FILE FROM SERVER"""
    """ file FORMAT:
    [
        
        {
            "counter": "33387b44496727cd8abe2d4cddd9ce4b09def3073fff60a867396aba849103fd821513564df7d93818fa1d59bc8e382011ca8b5cfb4b7ad8b4a20fd5919b227139",
            "vid": "33387b44496727cd8abe2d4cddd9ce4b09def3073fff60a867396aba849103fd821513564df7d93818fa1d59bc8e382011ca8b5cfb4b7ad8b4a20fd5919b227139",
            "vote": "33387b44496727cd8abe2d4cddd9ce4b09def3073fff60a867396aba849103fd821513564df7d93818fa1d59bc8e382011ca8b5cfb4b7ad8b4a20fd5919b227139"
        },
        {
            "counter": "33387b44496727cd8abe2d4cddd9ce4b09def3073fff60a867396aba849103fd821513564df7d93818fa1d59bc8e382011ca8b5cfb4b7ad8b4a20fd5919b227139",
            "vid": "33387b44496727cd8abe2d4cddd9ce4b09def3073fff60a867396aba849103fd821513564df7d93818fa1d59bc8e382011ca8b5cfb4b7ad8b4a20fd5919b227139",
            "vote": "33387b44496727cd8abe2d4cddd9ce4b09def3073fff60a867396aba849103fd821513564df7d93818fa1d59bc8e382011ca8b5cfb4b7ad8b4a20fd5919b227139"
        }
    ]
    
    """
    ctxts = []
    lookuptable = {}

    for ballot in new_dict_list:
        voterID = ballot["vid"]
        counter = ballot["counter"]

        voterID_c1, voterID_c2 = getFirstHalf(voterID), getSecondHalf(voterID)
        counter_c1, counter_c2 = getFirstHalf(counter), getSecondHalf(counter)

        vid_ctxt = elgamal.Ciphertext(
            EcPt_from_hexstr(voterID_c1), EcPt_from_hexstr(voterID_c2)
        )

        counter_ctxt = elgamal.Ciphertext(
            EcPt_from_hexstr(counter_c1), EcPt_from_hexstr(counter_c2)
        )

        vote = Bn.from_hex(ballot["vote"])
        vote_point = vote * G.generator()

        lookuptable[vote_point] = vote

        ctxts.append(
            BallotBundle(
                vid_ctxt,
                counter_ctxt,
                elgamal.Ciphertext(infinity, infinity),
                # Pallier votes from JS files are being encrypted
                VoteVector([pk.encrypt(vote * G.generator())]),
            )
        )

    return ctxts, lookuptable


def remove_first_n_characters(a_string, number_to_remove):
    """Removes the first n characters from a string"""
    return a_string[:number_to_remove]


if __name__ == "__main__":

    #####################################################
    #   This is for passing arguments from server file
    #####################################################
    parser = argparse.ArgumentParser()


    # SESSION ID IS THE SESSION ID OF THE VOTING SESSION
    parser.add_argument('--sessionID')
    # PARTY ID IS THE PARTY ID OF THE PARTY THAT IS RUNNING THIS FILE
    parser.add_argument('--partyID')
    # PRIV KEY IS THE PRIVATE KEY OF THE PARTY THAT IS RUNNING THIS FILE
    parser.add_argument('--priv_key')
    args = parser.parse_args()

    sessionId = args.sessionID
    # PARTY PROVIDE WILL PROVIDE VOTE(PALLIER) , VOTER_ID(EL-GAMMAL), VOTE_INDEX(COUNTER), 
    partyID = args.partyID
    priv_key = (
        args.priv_key
    )

    privK = Bn.from_hex(priv_key)
    public_key = privK * G.generator()
    key_pair = elgamal.KeyPair(G, privK)

    # this pk is the public key
    pk = key_pair.pk


    pcname = "http://DESKTOP-P4BSU6U.local:3100"
    print(pcname)
    # # TODO: Data test runs
    voteData = req.request(method="GET", url=pcname + "/Vote/" + sessionId)

    myVotes = [
        {
            "counter": tVote["token"]["counter"],
            "vid": tVote["token"]["vid"],
            "vote": tVote["original"]["vote"],
        }
        for tVote in (
            {
                "original": vote,
                "token": next(
                    token
                    for token in json.loads(vote["token"])
                    if token["partyId"] == partyID
                ),
            }
            for vote in voteData.json()
        )
    ]
    print("votes \n ", myVotes)


table = req.request(
    method='GET', url=pcname + '/Lookup')

lookUp = makeLookUpFromJSON(table.json())




key_pair = elgamal.KeyPair(G, privK)
# this pk is the public key
pk = key_pair.pk

ctxts, votesLookUp = generateBallotsFromJson(pk, myVotes)




LTBfilter = LTBforFilter(table.json())
print(LTBfilter)
m = 4  # Randomizer
phi = Filter(key_pair, key_pair.pk, ctxts, m,
             LTBfilter, votesLookUp)


highestCounters = phi.highest_counters


votes = [hex(vote) for vote in phi.actual_votes]
strvotes = json.dumps(votes)


counterList = []
for vote in phi.actual_votes:
    for token in phi.counter_vote_list:
        # if vote matches append the counter
        if (hex(vote) == str(token["vote"])):
            counterList.append(str(token["counter"]))

strCounters = json.dumps(counterList)
obj = {"partyID": partyID, "votes": strvotes, "counters": strCounters}
print("filter_obj", obj)


url = pcname+'/Vote/StoreFiltered'
resp = req.post(url, json=obj)
# print(resp)
