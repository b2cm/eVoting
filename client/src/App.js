import React, { Component } from "react";
import EvotingFactory from "./contracts/EvotingFactory.json";
import EvotingLogic from "./contracts/EvotingLogic.json";
import Web3 from "web3";

import "./App.css";

class App extends Component {

  constructor(props) {
    super(props)
    this.state = { storageHash: undefined, web3: null, evotingLogic: null,
      accounts: null, evotingFactory: null, voteDescription: '', evotingProxy: null, isCloneInitialized: false,
      admin1: '', admin2: '', admin3: '', admin4: '', admin5: '',
      parameter_gg: '', parameter_pp: '', parameter_vk: ''};

    this.handleChange = this.handleChange.bind(this);
    this.createClone = this.createClone.bind(this);
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = new Web3(Web3.givenProvider || 'http://localhost:7545')

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      
      // Get evotingFactory smart contract
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = EvotingFactory.networks[networkId]
      const evotingFactory = new web3.eth.Contract(EvotingFactory.abi, deployedNetwork.address)
      // Get evoting logic implementation 
      const evotingLogic = EvotingLogic.networks[networkId].address
          
      // Set web3, accounts, and contract to the state.
      this.setState({ web3, accounts, evotingLogic, evotingFactory })
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };


  handleChange(event) {
    const value = event.target.value
    const name = event.target.name
    this.setState( {[name]: value});
  }


  createClone = async (event) => {
    event.preventDefault();
    const { web3, accounts, evotingFactory, evotingLogic } = this.state; 
    const result = await evotingFactory.methods.createClone(evotingLogic).send({from: accounts[0]})
    //console.log(result)
    const evotingProxyAddress = result.events.ProxyCreated.returnValues[0]
    const evotingProxy = new web3.eth.Contract(EvotingLogic.abi, evotingProxyAddress)
    this.setState({evotingProxy})
  }

  getStorageHash = async() => {
    const { evotingProxy ,accounts } = this.state
    // Get the stored hash from the evoting contract to prove it worked.
    const hash = await evotingProxy.methods.getHashedParameters(accounts[0]).call()
    // Update state with the result.
    this.setState({ storageHash: hash })
    
  }

  submitInitCloneContractParamaters = async(event) => {
    event.preventDefault()
    const { evotingProxy, accounts, voteDescription, admin1, admin2, admin3, admin4, admin5 } = this.state
    if(admin1 && admin2 && admin3 && admin4 && admin5) {
      const result = await evotingProxy.methods.init(voteDescription, admin1, admin2, admin3, admin4, admin5).send({ from: accounts[0]})
      if(result.events.InitContract){
        this.setState({ isCloneInitialized: true})
      }
    }
  }

  submitAdminParameters = async(event) => {
    event.preventDefault()
    const {evotingProxy, accounts, parameter_gg, parameter_pp, parameter_vk, storageHash } = this.state
    let response
    // Commit value
    if (!storageHash) {
      response = await evotingProxy.methods.commitParameters(parameter_gg, parameter_pp, parameter_vk).send({ from: accounts[0]})
    } else {
      response = await evotingProxy.methods.updateParameters(parameter_gg, parameter_pp, parameter_vk).send({ from: accounts[0]})
    }
    //console.log(response)
    this.getStorageHash();

  
  }


  createContract() {
    
    return(
      <form onSubmit={this.createClone}>
          <p><input type="submit" value="Create a voting smart contract" /></p>
        </form>
    )
  }

  initContract() {
    return(
      <div>
        <p> Init the contract </p>
          <form onSubmit={this.submitInitCloneContractParamaters}>
              <p><input type="text" name="voteDescription" placeholder="Vote description" value={this.state.voteDescription} onChange={this.handleChange}></input></p>
              <p><input type="text" name="admin1" placeholder="first administrator" value={this.state.admin1} onChange={this.handleChange} /></p>
              <p><input type="text" name="admin2" placeholder="second administrator" value={this.state.admin2} onChange={this.handleChange} /></p>  
              <p><input type="text" name="admin3" placeholder="third administrator" value={this.state.admin3} onChange={this.handleChange} /></p>
              <p><input type="text" name="admin4" placeholder="fourth administrator" value={this.state.admin4} onChange={this.handleChange} /></p>  
              <p><input type="text" name="admin5" placeholder="fifth administrator" value={this.state.admin5} onChange={this.handleChange} /></p>
              <p><input type="submit" value="Submit" /></p> 
          </form>
      </div>
    )
  }

  addParamaters() {
    return(
      <div>
        {this.state.storageHash ? <p> Update paramaters </p> : <p> Enter parameters </p>}
          <form onSubmit={this.submitAdminParameters}>
              <p><input type="number" name="parameter_gg" placeholder="paramater gg" value={this.state.parameter_gg} onChange={this.handleChange} /></p>
              <p><input type="number" name="parameter_pp" placeholder="paramater pp" value={this.state.parameter_pp} onChange={this.handleChange} /></p>  
              <p><input type="number" name="parameter_vk" placeholder="paramater vk" value={this.state.parameter_vk} onChange={this.handleChange} /></p>
              <p><input type="submit" value="Submit" /></p>
              {this.state.storageHash ? <p>The stored hash is: {this.state.storageHash}</p> : <p></p> } 
          </form>
      </div>
    )
  }


  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>First prototype!</h1>
        <h2>Smart Contract Factory</h2>
        {!this.state.evotingProxy ? this.createContract() :
            !this.state.isCloneInitialized ? this.initContract() : this.addParamaters()}
      </div>
    );
  }
}



export default App;
