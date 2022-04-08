# vrf-secp256r1-solidity 

This library is an implementation of Verifiable Random Functions (VRFs) written in Solidity. More precisely, this library implements verification functions for VRF proofs based on the Elliptic Curve (EC) `Secp256r1`.

The solidity library has been designed aiming at decreasing gas consumption and its complexity due to EC operations.

It provides two main `pure` functions for verifying VRF proofs:
- **verify**:
  - _Description_: VRF *full* verification (requires heavy EC computation)
  - _Inputs_:
    - *_publicKey*: The public key as an array composed of `[pubKey-x, pubKey-y]`
    - *_proof*: The VRF proof as an array composed of `[gamma-x, gamma-y, c, s]`
    - *_message*: The message (in bytes) used for computing the VRF
  - _Output_:
    - true, if VRF proof is valid
- **fastVerify**:
  - _Description_: VRF *fast* verification by providing additional EC points.
  - _Inputs_:
    - *_publicKey*: The public key as an array composed of `[pubKey-x, pubKey-y]`
    - *_proof*: The VRF proof as an array composed of `[gamma-x, gamma-y, c, s]`
    - *_message*: The message (in bytes) used for computing the VRF
    - *_uPoint*: The `u` EC point defined as `U = s*B - c*Y`
    - *_vComponents*: The components required to compute `v` as `V = s*H - c*Gamma`
  - _Output_:
    - true, if VRF proof is valid

Additionally, the library provides some auxiliary `pure` functions to facilitate computing the aforementioned input parameters:

- **decodeProof**:
  - _Description_: Decode from bytes to VRF proof
  - _Input_:
    - *_proof*: The VRF proof as bytes
  - _Output_:
    - The VRF proof as an array composed of `[gamma-x, gamma-y, c, s]`
- **decodePoint**:
  - _Description_: Decode from bytes to EC point
  - _Input_:
    - *_point*: The EC point as bytes
  - _Output_:
    - The point as `[point-x, point-y]`
- **computeFastVerifyParams**:
  - _Description_: Compute the parameters (EC points) required for the VRF fast verification function
  - _Inputs_:
    - *_publicKey*: The public key as an array composed of `[pubKey-x, pubKey-y]`
    - *_proof*: The VRF proof as an array composed of `[gamma-x, gamma-y, c, s]`
    - *_message*: The message (in bytes) used for computing the VRF
  - _Output_:
    - The fast verify required parameters as the tuple `([uPointX, uPointY], [sHX, sHY, cGammaX, cGammaY])`
- **gammaToHash**:
  - _Description_: Computes the VRF hash output as result of the digest of a ciphersuite-dependent prefix concatenated with the gamma point. This hash can be used for deterministically generating verifiable pseudorandom numbers.
  - _Inputs_:
    - *_gammaX*: The x-coordinate of the gamma EC point
    - *_gammaY*: The y-coordinate of the gamma EC point
  - _Output_:
    - The VRF hash ouput as shas256 digest


## Benchmark

### Gas analysis

·--------------------------------------------|---------------------------|-------------|----------------------------·
|    Solc version: 0.6.12                    ·  Optimizer enabled: true  ·  Runs: 200  ·  Block target limit:       |
|                                            |                           |                    15000000 gas          │
·············································|···························|·············|·····························
|  Methods                                   ·              100 gwei/gas               ·              usd/eth       │
·················|···························|·············|·············|·············|··············|··············
|  Contract      ·  Method                   ·  Min        ·  Max        ·  Avg        ·  # calls     ·  usd (avg)  │
·················|···························|·············|·············|·············|··············|··············
|  VRF           ·  computeFastVerifyParams  ·    1501040  ·    1656237  ·    1568885  ·          10  ·             │  
·················|···························|·············|·············|·············|··············|··············
|  VRF           ·  decodeProof              ·      49228  ·      49268  ·      49247  ·          10  ·             │  
·················|···························|·············|·············|·············|··············|··············
|  VRF           ·  fastVerify               ·     85018   ·     134961  ·     96134   ·          10  ·             │  
·················|···························|·············|·············|·············|··············|··············
|  VRF           ·  gammaToHash              ·      24143  ·      24155  ·      24152  ·          10  ·             │   
·················|···························|·············|·············|·············|··············|··············
|  VRF           ·  verify                   ·    1531205  ·    1687832  ·    1600353  ·          10  ·             │   
·--------------------------------------------|-------------|-------------|-------------|--------------|-------------·



### Time analysis


·--------------------------------------------|-------------------------------------------------------------------------------------|-------------·
|    Solc version: 0.6.12                    ·                    Optimizer enabled: true     Runs: 200                            ·             |
·············································|·········································|···········································|··············
|  Methods                                   ·              SECP256R1                  ·    SECP256R1                              ·             |
·················|···························|·············|·············|·············|··············|·············|··············|··············
|  Contract      ·  Method                   ·  Min        ·  Max        ·  Avg        ·  Min         ·   Max       ·    Avg       ·   #calls    |
·················|···························|·············|·············|·············|··············|·············|··············|··············
|  VRF           ·  computeFastVerifyParams  ·             ·             ·             ·              ·             ·              ·             |
·················|···························|·············|·············|·············|··············|·············|··············|··············
|  VRF           ·  decodeProof              ·             ·             ·             ·              ·             ·              ·             |
·················|···························|·············|·············|·············|··············|·············|··············|··············
|  VRF           ·  fastVerify               ·             ·             ·             ·              ·             ·              ·             |
·················|···························|·············|·············|·············|··············|·············|··············|··············
|  VRF           ·  gammaToHash              ·             ·             ·             ·              ·             ·              ·             |
·················|···························|·············|·············|·············|··············|·············|··············|··············
|  VRF           ·  verify                   ·             ·             ·             ·              ·             ·              ·             |
·--------------------------------------------|-------------|-------------|-------------|--------------|-------------|--------------|-------------·

gas used to verify the proof for 2 test vector using the fast verify method: 85018
gas used to verify the proof for 2 test vector using the fast verify method: 111492
* Wrong params
gas used to verify the proof for 2 test vector using the fast verify method: 85018
gas used to verify the proof for 2 test vector using the fast verify method: 68823