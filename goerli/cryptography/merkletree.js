//import { poseidon } from '@big-whale-labs/poseidon';
const poseidon = require('@big-whale-labs/poseidon').poseidon;


class Node {

  constructor(data, leftChild, rightChild, options = {isHashed: false}) {
    this.hash = !options.isHashed ? this.#hashFunction(data) : data;
    this.leftChild = leftChild;
    this.rightChild = rightChild;
    //console.log('hash', this.hash);
  }

  getHash = function () {
    return this.hash;
  };

  getLeftChild() {
    return this.leftChild
  }

  getRightChild() {
    return this.rightChild
  }

  #hashFunction = function (data) {
    let hashedValue;
    //console.log('data type', typeof(data));
    if (typeof data != "number" || typeof data != "bigint") {
      hashedValue = poseidon(data);
    } else {
      hashedValue = poseidon([data]);
    }
    return hashedValue;
  }
}



class MerkleTree {
  constructor(leafs, options = {}) {
    this.isHashed = options.isHashed;
    this.leafs = leafs;
    this.leafNodes = this.#generateLeafNode(this.leafs, this.isHashed);
    this.layers = [this.leafNodes];
    this.#generateTree(this.leafNodes);
    this.root =  this.getRoot()
  }

  #generateTree(nodes) {
    while (nodes.length > 1) {
      const layerIndex = this.layers.length
      this.layers.push([])
      for (let i = 0; i < nodes.length; i += 2) {
        const node_1 = nodes[i];
        //const node_2 = i + 1 === nodes.length ? node_1 : nodes[i + 1]; // Duplicate the last node by odd length
      
        let node_2;
        if (i + 1 === nodes.length) {
          this.layers[layerIndex - 1].push(node_1);
          node_2 = node_1;
        } else {
          node_2 = nodes[i + 1];
        }
        

        const parent = new Node(
          [node_1.getHash(), node_2.getHash()],
          node_1,
          node_2
        );
        this.layers[layerIndex].push(parent)
      }
      nodes = this.layers[layerIndex];
    }
  };

  #generateLeafNode(leafs, isHashed) {
    const leafNodes = []
    for (let i = 0; i < leafs.length; i++) {
      //console.log('data', leafs[i]);
      const node = new Node(leafs[i], null, null, { isHashed})
      leafNodes.push(node)
    }
    return leafNodes
  }

  #getNodeIndex(node) {
    const dataLength = this.leafNodes.length
    for (let i = 0; i < dataLength; i++) {
      if (node.getHash() === this.leafNodes[i].getHash()) {
        return i
      }
    }
    return -1
  }

  getLayers() {
    return this.layers;
  }

  getRoot() {
    return this.layers[this.layers.length - 1][0].getHash()
  }

  getDepth() {
    return this.layers.length - 1
  }

  getLeafs() {
    return this.leafs;
  }


  getProof(leaf) {
    const isHashed = this.isHashed;
    const leafNode = new Node(leaf, null, null, { isHashed })
    let nodeIndex =  this.#getNodeIndex(leafNode)
    const siblingValues = []
    const directionSelector = []
    if (nodeIndex === -1) {
      throw Error('Node undefined')
    }

    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i]
      const isRightNode = nodeIndex % 2
      let siblingIndex = isRightNode ? nodeIndex - 1 : nodeIndex + 1
      
      if (siblingIndex < layer.length) {
        const path = isRightNode ? true : false
        directionSelector.push(path)
        const sibling = layer[siblingIndex].getHash().toString()
        siblingValues.push(sibling)
      }
      nodeIndex = (nodeIndex / 2) | 0
    }
    return {hashedID: leaf.toString(), siblingValues, directionSelector}
  }


  toString(data) {
    data = data.map(nested => {
      return nested.map(element => {
        return element.toString()
      })
    })
    return data
  }

  toJSON = (description) => {
    let data = {};
    let root;
    for (let i = 0; i < this.layers.length; i++) {
        const layer = this.layers[i]
        const layerData = []
        for (let j = 0; j < layer.length; j++) {
          const hash = layer[j].getHash().toString()
          layerData.push(hash);
          if (i === this.layers.length - 1) {
                root = hash;
            }
        }
        
        const layerNum = `layer${i}`
        data = {...data, [layerNum]: layerData}
    }
    return JSON.stringify({description, root, createdAt: Date(), data});
}


/*
  writeToFile(fileName) {
    let data = {}
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i]
      const layerData = []
      for (let j = 0; j < layer.length; j++) {
        const hash = layer[j].getHash()
        layerData.push(hash.toString())
      }
      const layerNum = `layer${i}`
      data = {...data, [layerNum]: layerData}
    }
    data = JSON.stringify(data)
    fs.writeFile(`src/files/${fileName}.json`, data, {encoding:'utf8',flag:'w'}, (err, res) => {
      if (err) console.log('error', err)
    })
  }
  */
}





module.exports =  MerkleTree;
//export default MerkleTree;

