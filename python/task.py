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

G = EcGroup(nid=714)
space = print("\n")
infinity = G.infinite()


def EcptTostr(ecpt):
    byte_strr = ecpt.export()
    point_to_str = binascii.hexlify(byte_strr).decode("utf8")
    return point_to_str


def convert_dec_to_bn(vids):

    converted_vids = []
    for i in vids:

        converted_vids.append(Bn.from_decimal(i))

    return converted_vids


def EcPt_from_hexstr(str):
    Byteseq = Bn.from_hex(str).binary()
    EllipticCurvePoint = EcPt.from_binary(Byteseq, G)
    return EllipticCurvePoint


def decrypt(priv_key, c1, c2):
    return c2 - (priv_key * c1)


def getSecondHalf(string):
    return string[len(string) // 2 :]


def getFirstHalf(string):
    return string[: len(string) // 2]


def makeLookUpFromJSON(json):

    # map every di
    lookuptable = {}
    for pv in json:

        print("object", type(pv))
        # pprint.pprint((pv['point']))
        point = "0" + pv["point"]
        # pprint.pprint(pv['value'])
        value = Bn.from_hex(pv["value"])
        lookuptable[point] = value
    return lookuptable


def LTBforFilter(json):
    lookuptable = {}
    for pv in json:
        print(pv['point'])
        point = EcPt_from_hexstr( pv["point"])
       # pprint.pprint(pv['value'])
        value = Bn.from_hex(pv["value"])
        lookuptable[point] = value
    return lookuptable


def generateBallotsFromJson(pk, new_dict_list):
    ctxts = []
    lookuptable = {}

    # # remove unwanted vote data
    # keysneeded = ["counter", "vote", "vid"]
    # new_dict_list = []
    # for dict in json_ballots:

    #     foo_dict = {k: v for k, v in dict.items() if k in keysneeded}
    #     new_dict_list.append(foo_dict)

    # split

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
    return a_string[:number_to_remove]


if __name__ == "__main__":
    sessionId = "5478e77b-4134-4739-add6-7bdb358d55b8"
    # JS FILE WILL PROVIDE VOTE(PALLIER) , VOTER_ID(EL-GAMMAL), VOTE_INDEX(COUNTER), =========ZNK, SIGNATURE======
    partyID = "4bdcfb5d-3e1c-400f-88d5-f86047b074e7"
    
    
    priv_key = (
        "33c8e19148be761e55ad2017361bd2a585f11bfbd9f3e1a96643bb64f94b3882"
    )
    
    privK = Bn.from_hex(priv_key)
    public_key = privK * G.generator()
    key_pair = elgamal.KeyPair(G, privK)
    
    # this pk is the public key
    pk = key_pair.pk

    # print("public key = ", public_key )
    # counter = "33387b44496727cd8abe2d4cddd9ce4b09def3073fff60a867396aba849103fd821513564df7d93818fa1d59bc8e382011ca8b5cfb4b7ad8b4a20fd5919b227139"
    # counter_c1, counter_c2 = getFirstHalf(counter), getSecondHalf(counter)

    # counter_ctxt = elgamal.Ciphertext(
    #         EcPt_from_hexstr(counter_c1), EcPt_from_hexstr(counter_c2)
    #     )


    # decrypted_counter = counter_ctxt.decrypt(privK)

    # print("decrypted = ", decrypted_counter)
    # # counter_ = Bn.from_hex("6222de")
    # # print(counter_ *G.generator())
    # exit(0)

    # print(public_key, "\n \n")
    pcname = "http://localhost:3100"
    print(pcname)
    # # TODO: Data test runs
    voteData = req.request(method="GET", url=pcname + "/Vote/" + sessionId)

# print(voteData)
# print(voteData.json())
    keysneeded = ["counter", "vote", "vid"]

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
    method='GET', url=pcname +'/Lookup')

lookUp = makeLookUpFromJSON(table.json())
#print("lookup \n",lookUp)


# TODO: TESTING NEW BALLOTS
key_pair = elgamal.KeyPair(G, privK)
# this pk is the public key
pk = key_pair.pk
ctxts, votesLookUp = generateBallotsFromJson(pk, myVotes)




print(ctxts)
print(votesLookUp)


LTBfilter = LTBforFilter(table.json())
print(LTBfilter)
m = 4  # Randomizer
phi = Filter(key_pair, key_pair.pk, ctxts, m,
             LTBfilter, votesLookUp)

print("final output outside", phi.actual_votes)
#votes = json.dumps(phi.actual_votes)


strvotes = json.dumps([hex(vote) for vote in phi.actual_votes])

obj={"partyID":partyID,"votes":strvotes}
print("objj",obj)


url = pcname+'/Vote/StoreFiltered'
resp = req.post(url, json=obj)
print(resp)
