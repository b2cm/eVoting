const EvotingFactory = artifacts.require('./EvotingFactory')
const VotingLogic = artifacts.require('./EvotingLogic')


require('../client/node_modules/chai').use(require('../client/node_modules/chai-as-promised/lib/chai-as-promised')).should()


const EVM_REVERT = 'VM Exception while processing transaction: revert'


contract("Evoting", accounts => {
    let factory
    let implementation
    let evotingLogicAddress
    let proxyAddress
    let proxy
    let result
    let log

    beforeEach( async () => {
        implementation = await VotingLogic.new()
        factory = await EvotingFactory.new()
        evotingLogicAddress = implementation.address
        
    })

    describe('deployment proxy factory', () => {
        
        it('should create a new proxy', async () => { 
            result = await factory.createClone(evotingLogicAddress)
            log = result.logs[0]
            proxyAddress = log.args[0]
            assert.equal(log.event, 'ProxyCreated', `Proxy wasn't create`)    
        })
    })

    describe('deployment proxy', () => {

        describe('success', () => {
            it('should init the proxy', async () => {
                proxy = await VotingLogic.at(proxyAddress)
                result = await proxy.init('voting', accounts[0], accounts[1], accounts[2], accounts[3], accounts[4])
                log = result.logs[0]
                assert.equal(log.event, 'InitContract', 'proxy has not be initialized.')
            })

            it('should committ parameters', async () => {
                result = await proxy.commitParameters(11, 22, 33, { from: accounts[0]})
                log = result.logs[0]
                log.event.should.equal('ParametersCommited')
            })

            it('should update the committed parameters', async () => {
                result = await proxy.updateParameters(44, 55, 66, { from: accounts[0]})
                log = result.logs[0]
                log.event.should.equal('ParametersUpdated')
            })
        })

        describe('faillure', () => {
            it('should fail to init the proxy twice ', async () => {
                const proxy = await VotingLogic.at(proxyAddress)
                await proxy.init('voting', accounts[0], accounts[1], accounts[2], accounts[3], accounts[4]).should.be.rejectedWith(EVM_REVERT)
            })        
    
            it('should fail to committ parameters twice', async () => {
                await proxy.commitParameters(11, 22, 33, { from: accounts[0]}).should.be.rejectedWith(EVM_REVERT)
            })

            it('should fail to update paramaters', async () => {
                await proxy.updateParameters(44, 77, 33, { from: accounts[1]}).should.be.rejectedWith(EVM_REVERT)
            })
        })
        
    })


})

