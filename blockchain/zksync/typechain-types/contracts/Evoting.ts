/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "../common";

export declare namespace Utils {
  export type BallotPaperStruct = {
    ballotType: BigNumberish;
    name: string;
    information: string;
    title: string;
    candidates: string[];
    maxSelectableAnswer: BigNumberish;
  };

  export type BallotPaperStructOutput = [
    number,
    string,
    string,
    string,
    string[],
    BigNumber
  ] & {
    ballotType: number;
    name: string;
    information: string;
    title: string;
    candidates: string[];
    maxSelectableAnswer: BigNumber;
  };

  export type ProofStruct = { p1: string[]; p2: string[]; p3: string[] };

  export type ProofStructOutput = [string[], string[], string[]] & {
    p1: string[];
    p2: string[];
    p3: string[];
  };

  export type SignatureStruct = { y0: string; s: string; c: string[] };

  export type SignatureStructOutput = [string, string, string[]] & {
    y0: string;
    s: string;
    c: string[];
  };

  export type TokenStruct = { vid: string; partyId: string; counter: string };

  export type TokenStructOutput = [string, string, string] & {
    vid: string;
    partyId: string;
    counter: string;
  };

  export type VoteStruct = {
    sessionId: string;
    cipherText: string;
    proof: Utils.ProofStruct;
    signature: Utils.SignatureStruct;
    groupId: string;
    token: Utils.TokenStruct[];
  };

  export type VoteStructOutput = [
    string,
    string,
    Utils.ProofStructOutput,
    Utils.SignatureStructOutput,
    string,
    Utils.TokenStructOutput[]
  ] & {
    sessionId: string;
    cipherText: string;
    proof: Utils.ProofStructOutput;
    signature: Utils.SignatureStructOutput;
    groupId: string;
    token: Utils.TokenStructOutput[];
  };

  export type VotingDetailsStruct = {
    name: string;
    description: string;
    start_time: BigNumberish;
    end_time: BigNumberish;
  };

  export type VotingDetailsStructOutput = [
    string,
    string,
    BigNumber,
    BigNumber
  ] & {
    name: string;
    description: string;
    start_time: BigNumber;
    end_time: BigNumber;
  };

  export type BallotDetailsStruct = {
    index: BigNumberish;
    ballot_paper: Utils.BallotPaperStruct;
  };

  export type BallotDetailsStructOutput = [
    BigNumber,
    Utils.BallotPaperStructOutput
  ] & { index: BigNumber; ballot_paper: Utils.BallotPaperStructOutput };
}

export interface EvotingInterface extends utils.Interface {
  functions: {
    "admin()": FunctionFragment;
    "ballot_papers(uint256)": FunctionFragment;
    "cancel_voting()": FunctionFragment;
    "canceled()": FunctionFragment;
    "createdAt()": FunctionFragment;
    "description()": FunctionFragment;
    "end_time()": FunctionFragment;
    "get_ballot_papers()": FunctionFragment;
    "get_details()": FunctionFragment;
    "get_state()": FunctionFragment;
    "get_votes()": FunctionFragment;
    "is_valid_ballot(uint256)": FunctionFragment;
    "name()": FunctionFragment;
    "start_time()": FunctionFragment;
    "update_voting((string,string,uint256,uint256),(uint256,(uint8,string,string,string,string[],uint256))[],(uint8,string,string,string,string[],uint256)[],uint256[])": FunctionFragment;
    "vote((string,string,(string[],string[],string[]),(string,string,string[]),string,(string,string,string)[]))": FunctionFragment;
    "voteID()": FunctionFragment;
    "votes(uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "admin"
      | "ballot_papers"
      | "cancel_voting"
      | "canceled"
      | "createdAt"
      | "description"
      | "end_time"
      | "get_ballot_papers"
      | "get_details"
      | "get_state"
      | "get_votes"
      | "is_valid_ballot"
      | "name"
      | "start_time"
      | "update_voting"
      | "vote"
      | "voteID"
      | "votes"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "admin", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "ballot_papers",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "cancel_voting",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "canceled", values?: undefined): string;
  encodeFunctionData(functionFragment: "createdAt", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "description",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "end_time", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "get_ballot_papers",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "get_details",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "get_state", values?: undefined): string;
  encodeFunctionData(functionFragment: "get_votes", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "is_valid_ballot",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "name", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "start_time",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "update_voting",
    values: [
      Utils.VotingDetailsStruct,
      Utils.BallotDetailsStruct[],
      Utils.BallotPaperStruct[],
      BigNumberish[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "vote",
    values: [Utils.VoteStruct]
  ): string;
  encodeFunctionData(functionFragment: "voteID", values?: undefined): string;
  encodeFunctionData(functionFragment: "votes", values: [BigNumberish]): string;

  decodeFunctionResult(functionFragment: "admin", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "ballot_papers",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "cancel_voting",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "canceled", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "createdAt", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "description",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "end_time", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "get_ballot_papers",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "get_details",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "get_state", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "get_votes", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "is_valid_ballot",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "start_time", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "update_voting",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "vote", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "voteID", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "votes", data: BytesLike): Result;

  events: {
    "BallotsAdded()": EventFragment;
    "BallotsRemoved()": EventFragment;
    "VoteReceived()": EventFragment;
    "VoterAdded(bool)": EventFragment;
    "VotingCanceled()": EventFragment;
    "VotingClosed()": EventFragment;
    "VotingOpened()": EventFragment;
    "VotingUpdated()": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "BallotsAdded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "BallotsRemoved"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "VoteReceived"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "VoterAdded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "VotingCanceled"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "VotingClosed"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "VotingOpened"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "VotingUpdated"): EventFragment;
}

export interface BallotsAddedEventObject {}
export type BallotsAddedEvent = TypedEvent<[], BallotsAddedEventObject>;

export type BallotsAddedEventFilter = TypedEventFilter<BallotsAddedEvent>;

export interface BallotsRemovedEventObject {}
export type BallotsRemovedEvent = TypedEvent<[], BallotsRemovedEventObject>;

export type BallotsRemovedEventFilter = TypedEventFilter<BallotsRemovedEvent>;

export interface VoteReceivedEventObject {}
export type VoteReceivedEvent = TypedEvent<[], VoteReceivedEventObject>;

export type VoteReceivedEventFilter = TypedEventFilter<VoteReceivedEvent>;

export interface VoterAddedEventObject {
  arg0: boolean;
}
export type VoterAddedEvent = TypedEvent<[boolean], VoterAddedEventObject>;

export type VoterAddedEventFilter = TypedEventFilter<VoterAddedEvent>;

export interface VotingCanceledEventObject {}
export type VotingCanceledEvent = TypedEvent<[], VotingCanceledEventObject>;

export type VotingCanceledEventFilter = TypedEventFilter<VotingCanceledEvent>;

export interface VotingClosedEventObject {}
export type VotingClosedEvent = TypedEvent<[], VotingClosedEventObject>;

export type VotingClosedEventFilter = TypedEventFilter<VotingClosedEvent>;

export interface VotingOpenedEventObject {}
export type VotingOpenedEvent = TypedEvent<[], VotingOpenedEventObject>;

export type VotingOpenedEventFilter = TypedEventFilter<VotingOpenedEvent>;

export interface VotingUpdatedEventObject {}
export type VotingUpdatedEvent = TypedEvent<[], VotingUpdatedEventObject>;

export type VotingUpdatedEventFilter = TypedEventFilter<VotingUpdatedEvent>;

export interface Evoting extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: EvotingInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    admin(overrides?: CallOverrides): Promise<[string]>;

    ballot_papers(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [number, string, string, string, BigNumber] & {
        ballotType: number;
        name: string;
        information: string;
        title: string;
        maxSelectableAnswer: BigNumber;
      }
    >;

    cancel_voting(
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    canceled(overrides?: CallOverrides): Promise<[boolean]>;

    createdAt(overrides?: CallOverrides): Promise<[BigNumber]>;

    description(overrides?: CallOverrides): Promise<[string]>;

    end_time(overrides?: CallOverrides): Promise<[BigNumber]>;

    get_ballot_papers(
      overrides?: CallOverrides
    ): Promise<[Utils.BallotPaperStructOutput[]]>;

    get_details(
      overrides?: CallOverrides
    ): Promise<
      [
        string,
        string,
        string,
        number,
        BigNumber,
        BigNumber,
        BigNumber,
        string,
        Utils.BallotPaperStructOutput[]
      ] & {
        _admin: string;
        _name: string;
        _description: string;
        _state: number;
        _start_time: BigNumber;
        _end_time: BigNumber;
        _createdAt: BigNumber;
        _voteID: string;
        _ballot_papers: Utils.BallotPaperStructOutput[];
      }
    >;

    get_state(overrides?: CallOverrides): Promise<[number] & { state: number }>;

    get_votes(overrides?: CallOverrides): Promise<[Utils.VoteStructOutput[]]>;

    is_valid_ballot(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    name(overrides?: CallOverrides): Promise<[string]>;

    start_time(overrides?: CallOverrides): Promise<[BigNumber]>;

    update_voting(
      _details: Utils.VotingDetailsStruct,
      _to_update: Utils.BallotDetailsStruct[],
      _to_add: Utils.BallotPaperStruct[],
      _to_delete: BigNumberish[],
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    vote(
      _vote: Utils.VoteStruct,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    voteID(overrides?: CallOverrides): Promise<[string]>;

    votes(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [
        string,
        string,
        Utils.ProofStructOutput,
        Utils.SignatureStructOutput,
        string
      ] & {
        sessionId: string;
        cipherText: string;
        proof: Utils.ProofStructOutput;
        signature: Utils.SignatureStructOutput;
        groupId: string;
      }
    >;
  };

  admin(overrides?: CallOverrides): Promise<string>;

  ballot_papers(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [number, string, string, string, BigNumber] & {
      ballotType: number;
      name: string;
      information: string;
      title: string;
      maxSelectableAnswer: BigNumber;
    }
  >;

  cancel_voting(
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  canceled(overrides?: CallOverrides): Promise<boolean>;

  createdAt(overrides?: CallOverrides): Promise<BigNumber>;

  description(overrides?: CallOverrides): Promise<string>;

  end_time(overrides?: CallOverrides): Promise<BigNumber>;

  get_ballot_papers(
    overrides?: CallOverrides
  ): Promise<Utils.BallotPaperStructOutput[]>;

  get_details(
    overrides?: CallOverrides
  ): Promise<
    [
      string,
      string,
      string,
      number,
      BigNumber,
      BigNumber,
      BigNumber,
      string,
      Utils.BallotPaperStructOutput[]
    ] & {
      _admin: string;
      _name: string;
      _description: string;
      _state: number;
      _start_time: BigNumber;
      _end_time: BigNumber;
      _createdAt: BigNumber;
      _voteID: string;
      _ballot_papers: Utils.BallotPaperStructOutput[];
    }
  >;

  get_state(overrides?: CallOverrides): Promise<number>;

  get_votes(overrides?: CallOverrides): Promise<Utils.VoteStructOutput[]>;

  is_valid_ballot(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<boolean>;

  name(overrides?: CallOverrides): Promise<string>;

  start_time(overrides?: CallOverrides): Promise<BigNumber>;

  update_voting(
    _details: Utils.VotingDetailsStruct,
    _to_update: Utils.BallotDetailsStruct[],
    _to_add: Utils.BallotPaperStruct[],
    _to_delete: BigNumberish[],
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  vote(
    _vote: Utils.VoteStruct,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  voteID(overrides?: CallOverrides): Promise<string>;

  votes(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [
      string,
      string,
      Utils.ProofStructOutput,
      Utils.SignatureStructOutput,
      string
    ] & {
      sessionId: string;
      cipherText: string;
      proof: Utils.ProofStructOutput;
      signature: Utils.SignatureStructOutput;
      groupId: string;
    }
  >;

  callStatic: {
    admin(overrides?: CallOverrides): Promise<string>;

    ballot_papers(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [number, string, string, string, BigNumber] & {
        ballotType: number;
        name: string;
        information: string;
        title: string;
        maxSelectableAnswer: BigNumber;
      }
    >;

    cancel_voting(overrides?: CallOverrides): Promise<void>;

    canceled(overrides?: CallOverrides): Promise<boolean>;

    createdAt(overrides?: CallOverrides): Promise<BigNumber>;

    description(overrides?: CallOverrides): Promise<string>;

    end_time(overrides?: CallOverrides): Promise<BigNumber>;

    get_ballot_papers(
      overrides?: CallOverrides
    ): Promise<Utils.BallotPaperStructOutput[]>;

    get_details(
      overrides?: CallOverrides
    ): Promise<
      [
        string,
        string,
        string,
        number,
        BigNumber,
        BigNumber,
        BigNumber,
        string,
        Utils.BallotPaperStructOutput[]
      ] & {
        _admin: string;
        _name: string;
        _description: string;
        _state: number;
        _start_time: BigNumber;
        _end_time: BigNumber;
        _createdAt: BigNumber;
        _voteID: string;
        _ballot_papers: Utils.BallotPaperStructOutput[];
      }
    >;

    get_state(overrides?: CallOverrides): Promise<number>;

    get_votes(overrides?: CallOverrides): Promise<Utils.VoteStructOutput[]>;

    is_valid_ballot(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    name(overrides?: CallOverrides): Promise<string>;

    start_time(overrides?: CallOverrides): Promise<BigNumber>;

    update_voting(
      _details: Utils.VotingDetailsStruct,
      _to_update: Utils.BallotDetailsStruct[],
      _to_add: Utils.BallotPaperStruct[],
      _to_delete: BigNumberish[],
      overrides?: CallOverrides
    ): Promise<void>;

    vote(_vote: Utils.VoteStruct, overrides?: CallOverrides): Promise<void>;

    voteID(overrides?: CallOverrides): Promise<string>;

    votes(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [
        string,
        string,
        Utils.ProofStructOutput,
        Utils.SignatureStructOutput,
        string
      ] & {
        sessionId: string;
        cipherText: string;
        proof: Utils.ProofStructOutput;
        signature: Utils.SignatureStructOutput;
        groupId: string;
      }
    >;
  };

  filters: {
    "BallotsAdded()"(): BallotsAddedEventFilter;
    BallotsAdded(): BallotsAddedEventFilter;

    "BallotsRemoved()"(): BallotsRemovedEventFilter;
    BallotsRemoved(): BallotsRemovedEventFilter;

    "VoteReceived()"(): VoteReceivedEventFilter;
    VoteReceived(): VoteReceivedEventFilter;

    "VoterAdded(bool)"(arg0?: null): VoterAddedEventFilter;
    VoterAdded(arg0?: null): VoterAddedEventFilter;

    "VotingCanceled()"(): VotingCanceledEventFilter;
    VotingCanceled(): VotingCanceledEventFilter;

    "VotingClosed()"(): VotingClosedEventFilter;
    VotingClosed(): VotingClosedEventFilter;

    "VotingOpened()"(): VotingOpenedEventFilter;
    VotingOpened(): VotingOpenedEventFilter;

    "VotingUpdated()"(): VotingUpdatedEventFilter;
    VotingUpdated(): VotingUpdatedEventFilter;
  };

  estimateGas: {
    admin(overrides?: CallOverrides): Promise<BigNumber>;

    ballot_papers(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    cancel_voting(
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    canceled(overrides?: CallOverrides): Promise<BigNumber>;

    createdAt(overrides?: CallOverrides): Promise<BigNumber>;

    description(overrides?: CallOverrides): Promise<BigNumber>;

    end_time(overrides?: CallOverrides): Promise<BigNumber>;

    get_ballot_papers(overrides?: CallOverrides): Promise<BigNumber>;

    get_details(overrides?: CallOverrides): Promise<BigNumber>;

    get_state(overrides?: CallOverrides): Promise<BigNumber>;

    get_votes(overrides?: CallOverrides): Promise<BigNumber>;

    is_valid_ballot(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    name(overrides?: CallOverrides): Promise<BigNumber>;

    start_time(overrides?: CallOverrides): Promise<BigNumber>;

    update_voting(
      _details: Utils.VotingDetailsStruct,
      _to_update: Utils.BallotDetailsStruct[],
      _to_add: Utils.BallotPaperStruct[],
      _to_delete: BigNumberish[],
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    vote(
      _vote: Utils.VoteStruct,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    voteID(overrides?: CallOverrides): Promise<BigNumber>;

    votes(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    admin(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    ballot_papers(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    cancel_voting(
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    canceled(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    createdAt(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    description(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    end_time(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    get_ballot_papers(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    get_details(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    get_state(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    get_votes(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    is_valid_ballot(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    name(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    start_time(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    update_voting(
      _details: Utils.VotingDetailsStruct,
      _to_update: Utils.BallotDetailsStruct[],
      _to_add: Utils.BallotPaperStruct[],
      _to_delete: BigNumberish[],
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    vote(
      _vote: Utils.VoteStruct,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    voteID(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    votes(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}