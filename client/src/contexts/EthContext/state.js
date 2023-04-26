const actions = {
  init: "INIT",
};


const initialState = {
  isDrawerOpen: false,
  artifacts: null,
  web3: null,
  accounts: null,
  networkID: null,
  l2Provider: null,
  contracts: null,
  l1Contracts: null,
  l2Contracts: null,
  signer: null,
  chainId: null,
  isAdminAuthenticated: false,
  isVoterAuthenticated: false,
};

const reducer = (state, action) => {
  const { type, data } = action;
  //console.log('state from state.js', state);
  switch (type) {
    case actions.init:
      return { ...state, ...data };
    default:
      throw new Error("Undefined reducer action type");
  }
};

export {
  actions,
  initialState,
  reducer
};
