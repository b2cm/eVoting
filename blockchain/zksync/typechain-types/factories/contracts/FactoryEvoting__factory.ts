/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  FactoryEvoting,
  FactoryEvotingInterface,
} from "../../contracts/FactoryEvoting";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "contractAddr",
        type: "address",
      },
    ],
    name: "VotingCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_admin",
        type: "address",
      },
    ],
    name: "add_admin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "get_admins",
    outputs: [
      {
        internalType: "address[]",
        name: "_admins",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "get_voteIDs",
    outputs: [
      {
        internalType: "string[]",
        name: "",
        type: "string[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_id",
        type: "string",
      },
    ],
    name: "get_voting",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "get_votings",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_admin",
        type: "address",
      },
    ],
    name: "is_admin",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_voteID",
        type: "string",
      },
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_description",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_startTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_endTime",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint8",
            name: "ballotType",
            type: "uint8",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "information",
            type: "string",
          },
          {
            internalType: "string",
            name: "title",
            type: "string",
          },
          {
            internalType: "string[]",
            name: "candidates",
            type: "string[]",
          },
          {
            internalType: "uint256",
            name: "maxSelectableAnswer",
            type: "uint256",
          },
        ],
        internalType: "struct Utils.BallotPaper[]",
        name: "_ballotPapers",
        type: "tuple[]",
      },
    ],
    name: "new_voting",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "votings_length",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x0004000000000002000100000000000200000000030100190000006003300270000001950430019700030000004103550002000000010355000001950030019d000100000000001f0000008001000039000000400010043f00000001012001900000002d0000c13d0000000001000031000000040110008c000000950000413d0000000201000367000000000101043b000000e001100270000001970210009c000000890000613d000001980210009c000000380000613d000001990210009c000000470000613d0000019a0210009c000000510000613d0000019b0210009c000000600000613d0000019c0210009c0000006c0000613d0000019d0210009c0000007a0000613d0000019e0110009c000000950000c13d0000000001000416000000000110004c000000950000c13d0000000001000031064e01200000040f064e04c50000040f000000400100043d00000000020000190000000003000019064e00d30000040f0000000001000416000000000110004c000000950000c13d064e00e60000040f000000200100003900000100001004430000012000000443000001000100003900000040020000390000019603000041064e00d30000040f0000000001000416000000000110004c000000950000c13d0000000001000031064e01360000040f064e05c80000040f0000000002010019000000400100043d000100000001001d064e015b0000040f0000000103000029000000000231004900000000010300190000000003000019064e00d30000040f0000000001000416000000000110004c000000950000c13d0000000001000031064e01dc0000040f064e035b0000040f000000400100043d00000000020000190000000003000019064e00d30000040f0000000001000416000000000110004c000000950000c13d0000000001000031064e01360000040f064e051a0000040f0000000002010019000000400100043d000100000001001d064e02ee0000040f0000000103000029000000000231004900000000010300190000000003000019064e00d30000040f0000000001000416000000000110004c000000950000c13d0000000001000031064e01360000040f0000000301000039000000000201041a000000400100043d000000000021043500000020020000390000000003000019064e00d30000040f0000000001000416000000000110004c000000950000c13d0000000001000031064e01200000040f064e050e0000040f000000000110004c0000000002000019000000010200c039000000400100043d000000000021043500000020020000390000000003000019064e00d30000040f0000000001000416000000000110004c000000950000c13d0000000001000031064e01360000040f064e055a0000040f0000000002010019000000400100043d000100000001001d064e02ee0000040f0000000103000029000000000231004900000000010300190000000003000019064e00d30000040f0000000001000416000000000110004c000000950000c13d0000000001000031064e02fd0000040f064e063e0000040f0000019f02100197000000400100043d000000000021043500000020020000390000000003000019064e00d30000040f00000000010000190000000002000019064e00dd0000040f0000019503000041000001950410009c00000000010380190000004001100210000001950420009c00000000020380190000006002200210000000000112019f0000000002000414000001950420009c0000000002038019000000c002200210000000000112019f000001a0011001c70000801002000039064e06490000040f0000000102200190000000ac0000613d000000000101043b000000000001042d00000000010000190000000002000019064e00dd0000040f000000840320008a000000640410003900000000050004140000000000340435000000440310003900000060040000390000000000430435000001a1030000410000000000310435000000040310003900000000000304350000019503000041000001950410009c00000000010380190000004001100210000001950420009c00000000020380190000006002200210000000000112019f000001950250009c00000000020300190000000002054019000000c002200210000000000112019f000001a0011001c70000800602000039064e06440000040f0000000102200190000000ce0000613d000000000101043b000000d20000013d00030000000103550000006001100270000101950010019d0000000001000019000000000001042d0000019504000041000001950510009c000000000104801900000040011002100000000001310019000001950320009c0000000002048019000000600220021000000000012100190000064f0001042e0000019503000041000001950420009c0000000002038019000001950410009c000000000103801900000040011002100000006002200210000000000112019f0000065000010430000300000000000200000000010004110000019f01100197000300000001001d00000000001004350000000101000039000200000001001d000000200010043f00000040020000390000000001000019064e00980000040f000000000101041a000000000110004c000001110000c13d00000002010000290000000301000029000000000200041a000001a20120009c000001120000813d0000000101200039000000000010041b000000000100041a000100000002001d000000000121004b000001190000a13d000000000000043500000020020000390000000001000019064e00980000040f000000010200002900000000012100190000000302000029000000000021041b000000000100041a000100000001001d00000000002004350000000201000029000000200010043f00000040020000390000000001000019064e00980000040f0000000102000029000000000021041b000000000001042d000001a30100004100000000001004350000004101000039000000040010043f00000024020000390000000001000019064e00dd0000040f000001a30100004100000000001004350000003201000039000000040010043f00000024020000390000000001000019064e00dd0000040f000000040110008a000001a4020000410000001f0310008c00000000030000190000000003022019000001a401100197000000000410004c0000000002008019000001a40110009c00000000010300190000000001026019000000000110004c000001330000613d00000004010000390000000201100367000000000101043b0000019f0210009c000001330000213d000000000001042d00000000010000190000000002000019064e00dd0000040f000000040110008a000000010200008a000001a403000041000000000221004b00000000020000190000000002032019000001a401100197000001a40410009c0000000003008019000001a401100167000001a40110009c00000000010200190000000001036019000000000110004c000001460000613d000000000001042d00000000010000190000000002000019064e00dd0000040f000000000301043300000000023204360000000004000019000000000534004b000001540000813d000000000524001900000020044000390000000006140019000000000606043300000000006504350000014c0000013d000000000123001900000000000104350000001f01300039000000200300008a000000000131016f0000000001210019000000000001042d000500000000000200000020030000390000000003310436000500000002001d000000000202043300000000002304350000004003100039000200000002001d00000005012002100000000002310019000100000003001d000400000003001d00000000030000190000000201000029000000000113004b0000017a0000813d00000001010000290000000001120049000300000003001d00000004030000290000000003130436000400000003001d00000005010000290000002001100039000500000001001d0000000001010433064e01490000040f000000030300002900000001033000390000000002010019000001680000013d0000000001020019000000000001042d0000001f01100039000000200200008a000000000221016f000000400100043d0000000002210019000000000312004b00000000030000190000000103004039000001a50420009c0000018a0000213d00000001033001900000018a0000c13d000000400020043f000000000001042d000001a30100004100000000001004350000004101000039000000040010043f00000024020000390000000001000019064e00dd0000040f00030000000000020000001f06100039000001a403000041000000000426004b00000000040000190000000004034019000001a405200197000001a407600197000000000657004b000000000300a019000000000557013f000001a40550009c000000000304c019000000000330004c000001d20000613d000300000002001d0000000202100367000000000302043b000001a20230009c000001d50000813d0000002001100039000100000001001d0000003f01300039000000200200008a000000000121016f000200000003001d064e017c0000040f00000001050000290000000209000029000000000291043600000000035900190000000304000029000000000343004b000001d20000213d0000001f0390018f00000002045003670000000505900272000001c00000613d000000000600001900000005076002100000000008720019000000000774034f000000000707043b00000000007804350000000106600039000000000756004b000001b80000413d000000000630004c000001cf0000613d0000000505500210000000000454034f00000000055200190000000303300210000000000605043300000000063601cf000000000636022f000000000404043b0000010003300089000000000434022f00000000033401cf000000000363019f000000000035043500000000029200190000000000020435000000000001042d00000000010000190000000002000019064e00dd0000040f000001a30100004100000000001004350000004101000039000000040010043f00000024020000390000000001000019064e00dd0000040f0012000000000002001000000001001d000000040110008a000001a402000041000000bf0310008c00000000030000190000000003022019000001a401100197000000000410004c0000000002008019000001a40110009c00000000010300190000000001026019000000000110004c000002e40000613d00000004010000390000000201100367000000000101043b000001a50210009c000002e40000213d00000004011000390000001002000029064e01910000040f000500000001001d00000024010000390000000201100367000000000101043b000001a50210009c000002e40000213d00000004011000390000001002000029064e01910000040f000400000001001d00000044010000390000000201100367000000000101043b000001a50210009c000002e40000213d00000004011000390000001002000029064e01910000040f000300000001001d00000002010003670000008402100370000000000202043b000200000002001d0000006402100370000000000202043b000100000002001d000000a402100370000000000202043b000001a50320009c000002e40000213d0000002303200039000001a4040000410000001006000029000000000563004b00000000050000190000000005048019000001a406600197000001a403300197000000000763004b0000000004008019000000000363013f000001a40330009c00000000030500190000000003046019000000000330004c000002e40000c13d0000000403200039000000000131034f000000000301043b000001a20130009c000002e70000813d0000002401200039000800000001001d0000000501300210001200000001001d0000002001100039001100000003001d064e017c0000040f000600000001001d000000110200002900000000002104350000000801000029000000120200002900000000021200190000001001000029000700000002001d000000000112004b000002e40000213d00000008020000290000000601000029000b00000001001d0000000701000029000000000112004b000002dd0000813d000900000002001d0000000201200367000000000101043b000001a50210009c000002e40000213d000000080200002900000000022100190000001001000029000d00000002001d0000000001210049000001a402000041000000c00310008c00000000030000190000000003024019000001a401100197000000000410004c000000000200a019000001a40110009c00000000010300190000000001026019000000000110004c000002e40000c13d000000400100043d000c00000001001d000001a60110009c000002e70000213d0000000c01000029000000c001100039000000400010043f0000000d010000290000000201100367000000000101043b000000ff0210008c000002e40000213d0000000c020000290000000001120436001200000001001d0000000d0100002900000020011000390000000201100367000000000101043b000001a50210009c000002e40000213d0000000d0200002900000000012100190000001002000029064e01910000040f000000120200002900000000001204350000000d0100002900000040011000390000000201100367000000000101043b000001a50210009c000002e40000213d0000000d0200002900000000012100190000001002000029064e01910000040f0000000c02000029000000400220003900000000001204350000000d0100002900000060011000390000000201100367000000000101043b000001a50210009c000002e40000213d0000000d0200002900000000012100190000001002000029064e01910000040f0000000c02000029000000600220003900000000001204350000000d0100002900000080021000390000000201000367000000000221034f000000000202043b000001a50320009c000002e40000213d0000000d0300002900000000023200190000001f03200039000001a4040000410000001006000029000000000563004b00000000050000190000000005048019000001a403300197000001a406600197000000000763004b0000000004008019000000000363013f000001a40330009c00000000030500190000000003046019000000000330004c000002e40000c13d000000000121034f000000000301043b000001a50130009c000002e70000213d0000002001200039000f00000001001d0000000501300210001200000001001d0000002001100039001100000003001d064e017c0000040f000a00000001001d000000110200002900000000002104350000000f01000029000000120200002900000000021200190000001001000029000e00000002001d000000000112004b000002e40000213d0000000b010000290000002001100039000b00000001001d0000000f030000290000000a040000290000000e01000029000000000113004b000002ce0000813d0000000201300367000000000101043b000001a50210009c000002e40000213d0000002004400039001100000004001d0000000f0200002900000000012100190000001002000029001200000003001d064e01910000040f0000001104000029000000120300002900000000001404350000002003300039000002bb0000013d0000000c0300002900000080013000390000000a0200002900000000002104350000000d01000029000000a0011000390000000201100367000000000101043b000000a00230003900000000001204350000000b010000290000000000310435000000090200002900000020022000390000023a0000013d000000050100002900000004020000290000000303000029000000010400002900000002050000290000000606000029000000000001042d00000000010000190000000002000019064e00dd0000040f000001a30100004100000000001004350000004101000039000000040010043f00000024020000390000000001000019064e00dd0000040f000000200300003900000000013104360000000003020433000000000031043500000000040000190000002001100039000000000534004b000002fc0000813d000000200220003900000000050204330000019f0550019700000000005104350000000104400039000002f30000013d000000000001042d0000000002010019000000040120008a000001a4030000410000001f0410008c00000000040000190000000004032019000001a401100197000000000510004c0000000003008019000001a40110009c00000000010400190000000001036019000000000110004c000003130000613d00000004010000390000000201100367000000000101043b000001a50310009c000003130000213d0000000401100039064e01910000040f000000000001042d00000000010000190000000002000019064e00dd0000040f0000004002100039000001a7030000410000000000320435000000200210003900000015030000390000000000320435000000200200003900000000002104350000006001100039000000000001042d0001000000000002000000000110004c000003240000613d000000000001042d000000400200043d000100000002001d000001a80100004100000000001204350000000401200039064e03160000040f000000010300002900000000023100490000000001030019064e00dd0000040f0000004002100039000001a903000041000000000032043500000020021000390000001a030000390000000000320435000000200200003900000000002104350000006001100039000000000001042d0000000003010019000000400100043d00000000040204330000000005000019000000000645004b000003440000813d000000000615001900000020055000390000000007250019000000000707043300000000007604350000033c0000013d000000000214001900000000003204350000002002400039064e00980000040f000000000001042d000000010210019000000001011002700000007f0310018f00000000010360190000001f0310008c00000000030000190000000103002039000000010330018f000000000232004b000003540000c13d000000000001042d000001a30100004100000000001004350000002201000039000000040010043f00000024020000390000000001000019064e00dd0000040f000f000000000002000800000006001d000d00000005001d000e00000004001d000b00000003001d000a00000002001d000200000001001d00000000010004110000019f01100197000c00000001001d00000000001004350000000101000039000100000001001d000000200010043f00000040020000390000000001000019064e00980000040f000000000101041a000000000110004c0000000001000019000000010100c039064e03200000040f000000400300043d000001aa0130009c0000048a0000813d0000002401300039000001ab0200004100000000002104350000008402300039000f00000002001d000000e001000039000000000012043500000164023000390000000201000029000300000003001d064e01490000040f00000000020100190000000f0100002900000000011200490000000303000029000000a40330003900000000001304350000000a01000029064e01490000040f00000000020100190000000301000029000000c4011000390000000f03000029000000000332004900000000003104350000000b01000029064e01490000040f000000030400002900000124024000390000000d03000029000000000032043500000104024000390000000e030000290000000000320435000000e4024000390000000c03000029000000000032043500000144024000390000000f0300002900000000033100490000000000320435000000080600002900000000020604330000000003210436000500000002001d00000005012002100000000004310019000400000003001d000000000500001900000000020600190000000501000029000000000115004b000003ff0000813d000600000005001d0000002002200039000000040100002900000000011400490000000003130436000700000003001d000800000002001d0000000001020433000900000001001d0000000021010434000000ff0110018f00000000031404360000000001020433000000c0020000390000000000230435000000c002400039000a00000004001d064e01490000040f00000009020000290000004002200039000000000202043300000000030100190000000a0400002900000040014000390000000004430049000000000041043500000000010200190000000002030019064e01490000040f00000009020000290000006002200039000000000202043300000000030100190000000a0400002900000060014000390000000004430049000000000041043500000000010200190000000002030019064e01490000040f0000000a03000029000000800230003900000000033100490000000904000029000000800440003900000000040404330000000000320435000f00000004001d00000000020404330000000003210436000c00000002001d00000005012002100000000002310019000b00000003001d000e00000003001d00000000030000190000000c01000029000000000113004b000003f30000813d0000000b010000290000000001120049000d00000003001d0000000e030000290000000003130436000e00000003001d0000000f010000290000002001100039000f00000001001d0000000001010433064e01490000040f0000000d0300002900000001033000390000000002010019000003e10000013d0000000a01000029000000a0011000390000000903000029000000a0033000390000000003030433000000000031043500000006050000290000000105500039000000000402001900000008020000290000000703000029000003a60000013d00000003010000290000000002140049064e00af0000040f000000000210004c000004910000613d0000019f01100198000f00000001001d0000000202000029000004b10000613d0000000201000039064e03380000040f000000000201041a000001ac022001970000000f03000029000000000232019f000000000021041b0000000301000039000000000301041a000001a50230009c0000048a0000213d0000000102300039000000000021041b000000000201041a000c00000003001d000000000232004b000004bb0000a13d000000000010043500000020020000390000000001000019000d00000002001d064e00980000040f00000002020000290000000032020434000b00000003001d000e00000002001d000001a50220009c0000000c020000290000048a0000213d0000000001210019000c00000001001d000000000101041a064e03490000040f0000000003010019000000200130008c0000000e050000290000000d02000029000004450000413d0000000c01000029000000000010043500000020020000390000000001000019000a00000003001d064e00980000040f0000000d020000290000000e050000290000001f035000390000000504300270000000200350008c000000000304001900000000030040190000000a040000290000001f04400039000000050440027000000000044100190000000001310019000000000341004b000004450000813d000000000001041b0000000101100039000004400000013d000000200150008c0000045a0000413d0000000c0100002900000000001004350000000001000019064e00980000040f0000000d070000290000000e06000029000000200200008a000000000226016f00000000030000190000000205000029000000000423004b0000000004570019000004670000813d0000000004040433000000000041041b000000200330003900000020077000390000000101100039000004510000013d000000000150004c00000000010000190000000f04000029000004600000613d0000000b0100002900000000010104330000000302500210000000010300008a000000000223022f000000000232013f000000000121016f0000000102500210000004740000013d000000000262004b000004710000813d0000000302600210000000f80220018f000000010300008a000000000223022f000000000232013f0000000003040433000000000223016f000000000021041b000000010160021000000001020000290000000f04000029000000000121019f0000000c02000029000000000012041b000000400100043d000000000041043500000195020000410000000003000414000001950430009c0000000003028019000001950410009c00000000010280190000004001100210000000c002300210000000000112019f000001ad011001c70000800d020000390000000103000039000001ae04000041064e06440000040f0000000101200190000004c20000613d000000000001042d000001a30100004100000000001004350000004101000039000000040010043f00000024020000390000000001000019064e00dd0000040f0000000302000367000000400100043d00000001040000310000001f0340018f0000000504400272000004a00000613d000000000500001900000005065002100000000007610019000000000662034f000000000606043b00000000006704350000000105500039000000000645004b000004980000413d000000000530004c000004af0000613d0000000504400210000000000242034f00000000044100190000000303300210000000000504043300000000053501cf000000000535022f000000000202043b0000010003300089000000000232022f00000000023201cf000000000252019f00000000002404350000000102000031064e00dd0000040f000000400200043d000f00000002001d000001a80100004100000000001204350000000401200039064e032e0000040f0000000f0300002900000000023100490000000001030019064e00dd0000040f000001a30100004100000000001004350000003201000039000000040010043f00000024020000390000000001000019064e00dd0000040f00000000010000190000000002000019064e00dd0000040f0003000000000002000200000001001d00000000010004110000019f0110019700000000001004350000000101000039000300000001001d000000200010043f0000004002000039000100000002001d0000000001000019064e00980000040f000000000101041a000000000110004c0000000001000019000000010100c039064e03200000040f00000002010000290000019f01100197000200000001001d00000000001004350000000301000029000000200010043f00000000010000190000000102000029064e00980000040f000000000101041a000000000110004c000004ff0000c13d00000002010000290000000301000029000000000200041a000001a20120009c000005000000813d0000000101200039000000000010041b000000000100041a000100000002001d000000000121004b000005070000a13d000000000000043500000020020000390000000001000019064e00980000040f000000010200002900000000012100190000000202000029000000000021041b000000000100041a000100000001001d00000000002004350000000301000029000000200010043f00000040020000390000000001000019064e00980000040f0000000102000029000000000021041b000000000001042d000001a30100004100000000001004350000004101000039000000040010043f00000024020000390000000001000019064e00dd0000040f000001a30100004100000000001004350000003201000039000000040010043f00000024020000390000000001000019064e00dd0000040f0000019f0110019700000000001004350000000101000039000000200010043f00000040020000390000000001000019064e00980000040f000000000101041a000000000110004c0000000001000019000000010100c039000000000001042d0002000000000002000000000100041a000100000001001d000000400200043d000200000002001d0000000000120435000000000000043500000020020000390000000001000019064e00980000040f0000000106000029000000020500002900000000020500190000000003000019000000000463004b000005300000813d0000002002200039000000000401041a000000000042043500000001033000390000000101100039000005280000013d00000000015200490000003f01100039000000200200008a000000000221016f0000000001520019000000000221004b00000000020000190000000102004039000001a50310009c0000053f0000213d00000001022001900000053f0000c13d000000400010043f0000000001050019000000000001042d000001a30100004100000000001004350000004101000039000000040010043f00000024020000390000000001000019064e00dd0000040f0001000000000002000000000301041a000100000002001d000000000223004b000005530000a13d000000000010043500000020020000390000000001000019064e00980000040f000000010200002900000000012100190000000002000019000000000001042d000001a30100004100000000001004350000003201000039000000040010043f00000024020000390000000001000019064e00dd0000040f000a0000000000020000000301000039000600000001001d000000000201041a000001a20120009c000005c10000813d00000005012002100000002001100039000a00000002001d064e017c0000040f000500000001001d0000000a02000029000000000621043600000000010000310000000201100367000001af02200198000005740000613d000000000300001900000005043002100000000005460019000000000441034f000000000404043b00000000004504350000000103300039000000000423004b0000056c0000413d000000000100004c000005760000613d000001000100008a000200000001001d0000000201000039000400000001001d0000002001000039000100000001001d00000000020000190000000601000029000300000006001d000000000301041a000000000332004b000005b80000813d000a00000002001d064e05460000040f000700000001001d000000000201041a000800000002001d000000400100043d000900000001001d0000000001020019064e03490000040f000000080200002900000000060100190000000101200190000005a70000c13d0000000201000029000000000112016f0000000905000029000000000015043500000000015600190000000402000029000000000021043500000020026000390000000001050019064e00980000040f000000050200002900000000030204330000000a02000029000000000323004b000005ba0000a13d000000050320021000000003060000290000000003630019000000000101041a0000019f011001970000000000130435000000010220003900000006010000290000057f0000013d0000000701000029000000000010043500000000010000190000000102000029000800000006001d064e00980000040f000000080600002900000000020000190000000905000029000000000362004b000005930000813d0000000003520019000000000401041a000000000043043500000020022000390000000101100039000005b00000013d0000000501000029000000000001042d000001a30100004100000000001004350000003201000039000000040010043f00000024020000390000000001000019064e00dd0000040f000001a30100004100000000001004350000004101000039000000040010043f00000024020000390000000001000019064e00dd0000040f00070000000000020000000301000039000200000001001d000000000201041a000001a20120009c000006370000813d0000000501200210000500000001001d0000002001100039000600000002001d064e017c0000040f0000000605000029000000050400002900000000030100190000006001000039000700000003001d00000000020000190000000000530435000000000342004b000005e10000813d0000002002200039000000070300002900000000033200190000000005010019000005d90000013d00000007010000290000002001100039000100000001001d00000000020000190000000201000029000000000301041a000000000332004b0000062e0000813d000600000002001d064e05460000040f0000000702000029000000000202043300000000030100190000000601000029000000000112004b000006300000a13d000300000003001d000000000103041a000400000001001d000000400200043d000500000002001d064e03490000040f000000040200002900000005050000290000000003010019000000000435043600000001012001900000061b0000c13d000001000100008a000000000112016f0000000000140435000000000130004c000000200200003900000000020060190000003f01200039000000200200008a000000000221016f0000000001520019000000000221004b00000000020000190000000102004039000001a50310009c000006370000213d0000000102200190000006370000c13d0000000604000029000000050240021000000001030000290000000002230019000000400010043f0000000000520435000000010140003900000007020000290000000002020433000000000242004b0000000002010019000005e50000213d000006300000013d0000000301000029000000000010043500000020020000390000000001000019000400000003001d000300000004001d064e00980000040f0000000307000029000000040600002900000005050000290000000002000019000000000362004b000006030000813d0000000003720019000000000401041a000000000043043500000020022000390000000101100039000006260000013d0000000701000029000000000001042d000001a30100004100000000001004350000003201000039000000040010043f00000024020000390000000001000019064e00dd0000040f000001a30100004100000000001004350000004101000039000000040010043f00000024020000390000000001000019064e00dd0000040f00000000020100190000000201000039064e03380000040f000000000101041a0000019f01100197000000000001042d00000647002104210000000102000039000000000001042d0000000002000019000000000001042d0000064c002104230000000102000039000000000001042d0000000002000019000000000001042d0000064e000004320000064f0001042e000006500001043000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ffffffff000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f7dc46b200000000000000000000000000000000000000000000000000000000468985f50000000000000000000000000000000000000000000000000000000084e46582000000000000000000000000000000000000000000000000000000008794b69d00000000000000000000000000000000000000000000000000000000aa173fda00000000000000000000000000000000000000000000000000000000aac132de00000000000000000000000000000000000000000000000000000000d4f86c5e0000000000000000000000000000000000000000000000000000000013a070b7000000000000000000000000ffffffffffffffffffffffffffffffffffffffff02000000000000000000000000000000000000000000000000000000000000009c4d535bdea7cd8a978f128b93471df48c7dbab89d703809115bdc118c235bfd00000000000000000000000000000000000000000000000100000000000000004e487b71000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ffffffffffffffff000000000000000000000000000000000000000000000000ffffffffffffff3f596f7520617265206e6f7420616e2061646d696e2e000000000000000000000008c379a000000000000000000000000000000000000000000000000000000000436f6e7472616374206465706c6f796d656e74206661696c732e000000000000000000000000000000000000000000000000000000000000ffffffffffffff7c010004897057596c02553733f82e2f719aa43b7cd32b2fa9b4cd212cf7baf3f6ffffffffffffffffffffffff000000000000000000000000000000000000000002000000000000000000000000000000000000200000000000000000000000008d59e26d1a30e4599d9266c3cc51905634249f88e542c997ce6769cf0c91e1db07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff3697eb0bba0377ee678f161faa59f57be7a1541aebf490d45a55cdf9332f61f2";

type FactoryEvotingConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: FactoryEvotingConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class FactoryEvoting__factory extends ContractFactory {
  constructor(...args: FactoryEvotingConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string }
  ): Promise<FactoryEvoting> {
    return super.deploy(overrides || {}) as Promise<FactoryEvoting>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): FactoryEvoting {
    return super.attach(address) as FactoryEvoting;
  }
  override connect(signer: Signer): FactoryEvoting__factory {
    return super.connect(signer) as FactoryEvoting__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): FactoryEvotingInterface {
    return new utils.Interface(_abi) as FactoryEvotingInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): FactoryEvoting {
    return new Contract(address, _abi, signerOrProvider) as FactoryEvoting;
  }
}