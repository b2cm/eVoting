const DATA = require("./data_p256_solidity.json")
const VRF_K1 = artifacts.require('./VRFTestHelper_SECP256K1')


contract("VRFTestHelper", () => {
    let vrf_k1
    let gasArray = []

    before( async () => {
        vrf_k1 = await VRF_K1.new()
    })

    describe('Estimate gas used by the decodeProof method:', () => {
        for (let i = 1; i < 100; i++) {
            for (const [, test] of DATA.secp256k1.entries()) {
                it('', async () => {
                    const pi_string = test.pi_string
                    const result = await vrf_k1.decodeProof(pi_string)  
                    const gasUsed = result.receipt.gasUsed
                    gasArray.push(gasUsed)
                })
            }
        }
        after(() => {
            const avgGas = gasArray.reduce((partialSum, a) => partialSum + a, 0) / gasArray.length
            console.log('max gas used:', Math.max(...gasArray))
            console.log('min gas used:', Math.min(...gasArray))
            console.log('average gas used:', avgGas)
            gasArray = []
        })
    })

    describe('Estimate gas used by the hashToTryAndIncrement method:', () => {
        for (let i = 1; i < 100; i++) {
            for (const [, test] of DATA.secp256k1.entries()) {
                it('', async () => {
                    const pk = [test.pk.x, test.pk.y]
                    const message = test.alpha_string  
                    
                    const result = await vrf_k1.hashToTryAndIncrement(pk, message)
                    const gasUsed = result.receipt.gasUsed
                    gasArray.push(gasUsed)
                })
            }
        }
        after(() => {
            const avgGas = gasArray.reduce((partialSum, a) => partialSum + a, 0) / gasArray.length
            console.log('max gas used:', Math.max(...gasArray))
            console.log('min gas used:', Math.min(...gasArray))
            console.log('average gas used:', avgGas)
            gasArray = []
        })
    })

    describe('Estimate gas used by the computeFastVerifyParams method:', () => {
        for (let i = 1; i < 10; i++) {
            for (const [, test] of DATA.secp256k1.entries()) {
                it('', async () => {
                    const pk = [test.pk.x, test.pk.y]
                    const message = test.alpha_string  
                
                    const proof = await vrf_k1.decodeProof.call(test.pi_string)
                    const result = await vrf_k1.computeFastVerifyParams(pk, proof, message)
                    const gasUsed = result.receipt.gasUsed
                    gasArray.push(gasUsed)
                })
            }
        }
        after(() => {
            const avgGas = gasArray.reduce((partialSum, a) => partialSum + a, 0) / gasArray.length
            console.log('max gas used:', Math.max(...gasArray))
            console.log('min gas used:', Math.min(...gasArray))
            console.log('average gas used:', avgGas)
            gasArray = []
        })
    })


    describe('Estimate gas used by the fastVerify method:', () => {
        for (let i = 1; i < 100; i++) {
            for (const [, test] of DATA.secp256k1.entries()) {
                it('', async () => {
                    const pk = [test.pk.x, test.pk.y]
                    const message = test.alpha_string
                    const uX = web3.utils.toBN(test.U.x)
                    const uY = web3.utils.toBN(test.U.y)
                    const sH_X = web3.utils.toBN(test.V.sH.x)
                    const sH_Y = web3.utils.toBN(test.V.sH.y)
                    const cGamma_X = web3.utils.toBN(test.V.cGamma.x)
                    const cGamma_Y = web3.utils.toBN(test.V.cGamma.y)
                    const uPoint = [uX, uY]
                    const vComponents = [sH_X, sH_Y, cGamma_X, cGamma_Y]
                    const proof = await vrf_k1.decodeProof.call(test.pi_string)
    
                    result = await vrf_k1.fastVerify(pk, proof, message, uPoint, vComponents)
                    const gasUsed = result.receipt.gasUsed
                    gasArray.push(gasUsed)

                })
            }
        }
        after(() => {
            const avgGas = gasArray.reduce((partialSum, a) => partialSum + a, 0) / gasArray.length
            console.log('max gas used:', Math.max(...gasArray))
            console.log('min gas used:', Math.min(...gasArray))
            console.log('average gas used:', avgGas)
            gasArray = []
        })   
    })

    describe('Estimate gas used by the verify method:', () => {
        for (let i = 1; i < 100; i++) {
            for (const [, test] of DATA.secp256k1.entries()) {
                it('', async () => {
                    const pk = [test.pk.x, test.pk.y]
                    const message = test.alpha_string        
                    const proof = await vrf_k1.decodeProof.call(test.pi_string)

                    const result = await vrf_k1.verify(pk, proof, message)
                    const gasUsed = result.receipt.gasUsed
                    gasArray.push(gasUsed)

                })
            }
        }
        after(() => {
            const avgGas = gasArray.reduce((partialSum, a) => partialSum + a, 0) / gasArray.length
            console.log('max gas used:', Math.max(...gasArray))
            console.log('min gas used:', Math.min(...gasArray))
            console.log('average gas used:', avgGas)
            gasArray = []
        }) 
    })

    describe('Estimate gas used by the proofToHash method:', () => {
        for (let i = 1; i < 100; i++) {
            for (const [, test] of DATA.secp256k1.entries()) {
                it('', async () => {
                    const proof = await vrf_k1.decodeProof.call(test.pi_string)
                    const gammaX = proof[0]
                    const gammaY = proof[1]

                    const result = await vrf_k1.proofToHash(gammaX, gammaY)
                    const gasUsed = result.receipt.gasUsed
                    gasArray.push(gasUsed)

                })

            }
        }
        after(() => {
            const avgGas = gasArray.reduce((partialSum, a) => partialSum + a, 0) / gasArray.length
            console.log('max gas used:', Math.max(...gasArray))
            console.log('min gas used:', Math.min(...gasArray))
            console.log('average gas used:', avgGas)
            gasArray = []
        })  
    })
})