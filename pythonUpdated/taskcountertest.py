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
space = print('\n')
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
    return string[len(string)//2:]


def getFirstHalf(string):
    return string[:len(string)//2]


def makeLookUpFromJSON(json):

    # map every di
    lookuptable = {}
    for pv in json:

        print("object", type(pv))
        # pprint.pprint((pv['point']))
        point = '0'+pv['point']
        # pprint.pprint(pv['value'])
        value = (Bn.from_hex(pv['value']))
        lookuptable[point] = value
    return lookuptable


def LTBforFilter(json):
    lookuptable = {}
    for pv in json:

        print("object", type(pv))
        # pprint.pprint((pv['point']))
        point = EcPt_from_hexstr('0'+pv['point'])
        # pprint.pprint(pv['value'])
        value = (Bn.from_hex(pv['value']))
        lookuptable[point] = value
    return lookuptable


def HandleJsData(listOfVotes, lookuptable, privK):
    # TODO: Algorithm
    # --INPUT: Vote dictionaries
    newListofVotes = []

    # split voterids and counter
    for vote in listOfVotes:
        voterID = vote['vid']
        counter = vote['counter']

        voterID_c1, voterID_c2 = getFirstHalf(voterID), getSecondHalf(voterID)
        counter_c1, counter_c2 = getFirstHalf(counter), getSecondHalf(counter)
    # store the encrypted form TODO:  ADD c1 and c2 keys in that dictionary
        vote.update(voterID_c1=voterID_c1, voterID_c2=voterID_c2,
                    counter_c1=counter_c1, counter_c2=counter_c2)

    # decrypt VoterIDs and Counters TODO: Replace VoterIDs and Counters in original dict with decrypted VoterID
        Ecpt_c1, Ecpt_c2 = EcPt_from_hexstr(
            voterID_c1), EcPt_from_hexstr(voterID_c2)
        decrypted_vid = decrypt(privK, Ecpt_c1, Ecpt_c2)

        c_Ecpt_c1, c_Ecpt_c2 = EcPt_from_hexstr(
            counter_c1), EcPt_from_hexstr(counter_c2)
        decrypted_counter = decrypt(privK, c_Ecpt_c1, c_Ecpt_c2)
        # -Replacing decrypted values in dictionary
        vote['vid'] = EcptTostr(decrypted_vid)
        vote['counter'] = EcptTostr(decrypted_counter)

    # convert counters to  original one so they can be sorted
        # TODO: Type check LTB and set
        vote['counter'] = lookuptable[vote['counter']]

    # group per vid : This creates ordering TODO:
    groupedDict = {}

    for item in listOfVotes:
        groupedDict.setdefault(item['vid'], []).append(item)
        # --- Each dictionary has a tuple  object  [0]-> VoterID , [1]->list of dictionaries

    # --- sort counters making sure that votes are sorted with them
    # ---Sorting the dictionaries
    ListOfSortedTuples = []

    for item in groupedDict.items():
        newlist = sorted(item[1], key=itemgetter('counter'))
        ListOfSortedTuples.append((item[0], newlist))

    # for every voterID get the counters and votes --prepare the data to return

    # ---- Now we have the sortedTuple
    voterids = []
    encrypted_vids = []
    encrypted_counters = []
    Array_of_votes = []
    print("ListOfSortedTuples")
    pprint.pprint(ListOfSortedTuples)

    for _tuple in ListOfSortedTuples:
        voterids.append(_tuple[0])
        # _tuple[1] is a list of dictionaries
        c1_vid = _tuple[1][0]["voterID_c1"]
        c2_vid = _tuple[1][0]["voterID_c2"]
        encrypted_vids.append([c1_vid, c2_vid])

        print("length of list of vids", len(_tuple[1]))
        Temp_counter_array = []
        for _dict in _tuple[1]:

            c1_counter = _dict["counter_c1"]
            c2_counter = _dict["counter_c2"]
            Temp_counter_array.append([c1_counter, c2_counter])
            Array_of_votes.append(Bn.from_hex(_dict['vote']))
        encrypted_counters.append(Temp_counter_array)
    return encrypted_counters, encrypted_vids, Array_of_votes


def generateBallotsFromJson(pk, json_ballots):
    ctxts = []
    lookuptable = {}
    # remove unwanted vote data
    keysneeded = ['counter', 'vote', 'vid']
    new_dict_list = []
    for dict in json_ballots:

        foo_dict = {k: v for k, v in dict.items() if k in keysneeded}
        new_dict_list.append(foo_dict)

    # split

    for ballot in new_dict_list:
        voterID = ballot['vid']
        counter = ballot['counter']

        voterID_c1, voterID_c2 = getFirstHalf(voterID), getSecondHalf(voterID)
        counter_c1, counter_c2 = getFirstHalf(counter), getSecondHalf(counter)

        vid_ctxt = elgamal.Ciphertext(EcPt_from_hexstr(
            voterID_c1), EcPt_from_hexstr(voterID_c2))

        counter_ctxt = elgamal.Ciphertext(EcPt_from_hexstr(
            counter_c1), EcPt_from_hexstr(counter_c2))

        vote = Bn.from_hex(ballot['vote'])
        vote_point = vote*G.generator()

        lookuptable[vote_point] = vote

        ctxts.append(
            BallotBundle(
                vid_ctxt,
                counter_ctxt,
                elgamal.Ciphertext(
                    infinity, infinity),

                # Pallier votes from JS files are being encrypted
                VoteVector(
                    [pk.encrypt(vote * G.generator())])
            )
        )

    return ctxts, lookuptable


if __name__ == "__main__":
    sessionId = '2f6e35af-4335-4e0a-8072-33a89d5579e8'
    # JS FILE WILL PROVIDE VOTE(PALLIER) , VOTER_ID(EL-GAMMAL), VOTE_INDEX(COUNTER), =========ZNK, SIGNATURE======

    #  same as the privkey in JS file
    priv_key = '68816124436164244368324790341406705996246732673439834868904672669751451971541'
    privK = Bn.from_decimal(priv_key)
    public_key = privK*G.generator()
    print(public_key, "\n \n")

# TODO: Data test runs
    voteData = req.request(
        method='GET', url='http://LAPTOP-LLR809GQ.local:3100/Vote/'+sessionId)

keysneeded = ['counter', 'vote', 'vid']
new_dict_list = []
for dict in voteData.json():

    foo_dict = {k: v for k, v in dict.items() if k in keysneeded}
    new_dict_list.append(foo_dict)

# print(voteData.json())

table = req.request(
    method='GET', url='http://LAPTOP-LLR809GQ.local:3100/Lookup')

lookup = makeLookUpFromJSON(table.json())

encrypted_counters, encrypted_vids, pallier_votes = HandleJsData(
    new_dict_list, lookup, privK)

# lookUp = makeLookUpFromJSON(table.json())


# # TODO: TESTING NEW BALLOTS
# key_pair = elgamal.KeyPair(G, privK)
# # this pk is the public key
# pk = key_pair.pk
# ctxts, votesLookUp = generateBallotsFromJson(pk, voteData.json())
# print(ctxts)
# print(votesLookUp)


# LTBfilter = LTBforFilter(table.json())
# print(LTBfilter)
# m = 4  # Randomizer
# phi = Filter(key_pair, key_pair.pk, ctxts, m,
#              LTBfilter, votesLookUp)
