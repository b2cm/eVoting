from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import os, sys
import ast

app = Flask(__name__)
cors = CORS(app)

app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/getResults/', methods=["POST"])
@cross_origin(origin='localhost',port=3000)
def getResults():
    # getting arguments from request
    sessionID = request.json['sessionID']
    partyID = request.json['partyID']
    priv_key = request.json['priv_key']

    # command to run task.py file and pass the arguments to it
    command = 'python task.py --sessionID ' + sessionID + ' --partyID ' + partyID + ' --priv_key ' + priv_key

    # get the obj from task.py output which has partyID and all the votes
    obj = os.popen(command).read()
    obj_name = "filter_obj"
    obj_str = obj[(obj.find(obj_name)+len(obj_name)+1):-1]
    obj = ast.literal_eval(obj_str)

    votes = ast.literal_eval(obj['votes'])
    # for i, vote in enumerate(ast.literal_eval(obj['votes']),1):
    #     votes[i] = vote
    
    return jsonify({
        'status': 200,
        'data': {
           'partyID': obj['partyID'],
           'votes': votes,
        },
        'msg': 'votes have been fetched successfully!',
     })




if __name__ == '__main__':
   app.run(debug = True, port=5000)
