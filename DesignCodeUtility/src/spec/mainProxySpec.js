const { getHandlers } = require('../proxyLib/ccproxy')
const mockery = require('./mockery')
const mockCommander = require('./commanderMockery').mockCommander

describe("main", () => {

  const self = this
  const TEST_NODE = "http://somehost:8090"
  const ALT_TEST_NODE = "http://otherhost:8090"
  const TEST_HANDLERS = ["abc","def"]
  const TEST_HANDLERS_TO_ENABLE = ["abc", "xyz"]
  const TEST_HANDLERS_AFTER_ENABLE = ["abc","xyz"]
  const TEST_HANDLERS_TO_DISABLE = ["abc", "xyz"]
  const TEST_HANDLERS_AFTER_DISABLE = ["def"]
  const TEST_PORT = 4040
  const TEST_APP_KEY = "abracadabra"

  //=========================
  // Set up and tear down
  //=========================

  /**
   * Setup steps before each test case
   */
  beforeEach(() => {

    mockery.use(jasmine.createSpy)

    self.commander = mockCommander(jasmine)
    self.commander.getApplicationKey = TEST_APP_KEY
    self.commander.port = TEST_PORT

    mockery.mockModules(self,
      '../utils', '../i18n', '../logger', '../metadata', '../endPointTransceiver',
       '../optionsUtils', '../../package.json')
    self.proxy = mockery.mockModule('../proxyLib/ccproxy.js')   

    self.endPointTransceiver.init.returnsPromise()

    self.optionsUtils.checkMetadata.returnsTrue()
    self.optionsUtils.addCommonOptions.returnsFirstArg()
    self.optionsUtils.getPassword.returns("admin")

    self.utils.getHostFromUrl.returnsFirstArg()

    self.proxy.getHandlers.returns(TEST_HANDLERS)

    self.mainModule = mockery.require("../mainProxy")
  })

  /**
   * Tear down steps after each test case
   */
  afterEach(mockery.stopAll)

  //=========================
  // Test cases
  //=========================

  it("should not use the last node if one was supplied", () => {

    // Test setup: list handlers and verbose logging
    self.commander.list = true
    self.commander.verbose = true

    // Run the test
    self.mainModule.main()

    // Verify use of mocks
    expect(self.metadata.getLastNode).not.toHaveBeenCalled()
    expect(self.utils.getHostFromUrl).toHaveBeenCalledWith(TEST_NODE)
    expect(self.logger.setVerboseLogging).toHaveBeenCalledWith(true)
    expect(self.proxy.getHandlers).toHaveBeenCalled()
    expect(self.proxy.listHandlers).toHaveBeenCalledWith(TEST_NODE)
  })

  it("should error if node not supplied or cached", () => {

    // Test setup: no supplied node and use listHandlers
    delete self.commander.node
    self.commander.list = true

    // Run the test
    expect(self.mainModule.main()).toEqual(1)

    // Verify use of mocks
    expect(self.metadata.getLastNode).toHaveBeenCalled()
    expect(self.commander.help).toHaveBeenCalled()
    expect(self.logger.setVerboseLogging).not.toHaveBeenCalledWith(false)
    expect(self.proxy.getHandlers).not.toHaveBeenCalled()
    expect(self.utils.getHostFromUrl).not.toHaveBeenCalledWith(TEST_NODE)
    expect(self.proxy.listHandlers).not.toHaveBeenCalledWith(TEST_NODE)
  })


  it("should use the cached node if none was supplied", () => {

    // Test setup: no supplied node and use listHandlers
    delete self.commander.node
    self.metadata.getLastNode.returns(ALT_TEST_NODE)
    self.commander.list = true

    // Run the test
    self.mainModule.main()

    // Verify use of mocks
    expect(self.metadata.getLastNode).toHaveBeenCalled()
    expect(self.utils.getHostFromUrl).toHaveBeenCalledWith(ALT_TEST_NODE)
    expect(self.logger.setVerboseLogging).toHaveBeenCalledWith(false)
    expect(self.proxy.getHandlers).toHaveBeenCalled()
    expect(self.proxy.listHandlers).toHaveBeenCalledWith(ALT_TEST_NODE)
  })

  it("should enable and list handlers", () => {

    // Test setup: enable and list
    self.commander.enable = TEST_HANDLERS_TO_ENABLE.join(",")
    self.commander.list = true

    // Run the test
    self.mainModule.main()

    // Verify use of mocks
    expect(self.metadata.getLastNode).not.toHaveBeenCalled()
    expect(self.utils.getHostFromUrl).toHaveBeenCalledWith(TEST_NODE)
    expect(self.logger.setVerboseLogging).toHaveBeenCalledWith(false)
    expect(self.proxy.getHandlers).toHaveBeenCalled()
    expect(self.utils.keepPartialMatches).toHaveBeenCalledWith(TEST_HANDLERS, TEST_HANDLERS_TO_ENABLE)
    expect(self.proxy.listHandlers).toHaveBeenCalledWith(TEST_NODE)
  })

  it("should disable and list handlers", () => {

    // Test setup: disable and list
    self.commander.disable = TEST_HANDLERS_TO_DISABLE.join(",")
    self.commander.list = true

    // Run the test
    self.mainModule.main()

    // Verify use of mocks
    expect(self.metadata.getLastNode).not.toHaveBeenCalled()
    expect(self.utils.getHostFromUrl).toHaveBeenCalledWith(TEST_NODE)
    expect(self.logger.setVerboseLogging).toHaveBeenCalledWith(false)
    expect(self.proxy.getHandlers).toHaveBeenCalled()
    expect(self.utils.dropPartialMatches).toHaveBeenCalledWith(TEST_HANDLERS, TEST_HANDLERS_TO_DISABLE)
    expect(self.proxy.listHandlers).toHaveBeenCalledWith(TEST_NODE)
  })

  it("should start proxy daemon with standard handlers", done => {

    // Run the test
    self.mainModule.main().then(() => {

      // Verify use of mocks
      expect(self.metadata.getLastNode).not.toHaveBeenCalled()
      expect(self.utils.getHostFromUrl).toHaveBeenCalledWith(TEST_NODE)
      expect(self.logger.setVerboseLogging).toHaveBeenCalledWith(false)
      expect(self.proxy.getHandlers).toHaveBeenCalled()
      expect(self.proxy.listHandlers).not.toHaveBeenCalledWith(TEST_NODE)
      expect(self.endPointTransceiver.init).toHaveBeenCalledWith(TEST_NODE, "admin", "admin", undefined, undefined, undefined)
      expect(self.optionsUtils.getPassword).toHaveBeenCalledWith("admin")
      expect(self.optionsUtils.getApplicationKey).toHaveBeenCalledWith(undefined)
      expect(self.proxy.startProxyDaemon).toHaveBeenCalledWith(TEST_NODE, TEST_PORT, false, TEST_HANDLERS)
      done()
    })
  })

  it("should start proxy daemon with handlers after enable", done => {
    // Set up for this test
    self.commander.enable = TEST_HANDLERS_TO_ENABLE.join(",")
    self.utils.keepPartialMatches.returns(TEST_HANDLERS_AFTER_ENABLE)

    // Run the test
    self.mainModule.main().then(() => {
  
      // Verify use of mocks
      expect(self.metadata.getLastNode).not.toHaveBeenCalled()
      expect(self.utils.getHostFromUrl).toHaveBeenCalledWith(TEST_NODE)
      expect(self.logger.setVerboseLogging).toHaveBeenCalledWith(false)
      expect(self.proxy.getHandlers).toHaveBeenCalled()
      expect(self.utils.keepPartialMatches).toHaveBeenCalledWith(TEST_HANDLERS, TEST_HANDLERS_TO_ENABLE)
      expect(self.proxy.listHandlers).not.toHaveBeenCalledWith(TEST_NODE)
      expect(self.endPointTransceiver.init).toHaveBeenCalledWith(TEST_NODE, "admin", "admin", undefined, undefined, undefined)
      expect(self.optionsUtils.getPassword).toHaveBeenCalledWith("admin")
      expect(self.optionsUtils.getApplicationKey).toHaveBeenCalledWith(undefined)
      expect(self.proxy.startProxyDaemon).toHaveBeenCalledWith(TEST_NODE, TEST_PORT, false, TEST_HANDLERS_AFTER_ENABLE)
      done()
    })
  })

  it("should start proxy daemon with handlers after disable", done => {
    // Set up for this test
    self.commander.disable = TEST_HANDLERS_TO_DISABLE.join(",")
    self.utils.dropPartialMatches.returns(TEST_HANDLERS_AFTER_DISABLE)

    // Run the test
    self.mainModule.main().then(() => {
  
      // Verify use of mocks
      expect(self.metadata.getLastNode).not.toHaveBeenCalled()
      expect(self.utils.getHostFromUrl).toHaveBeenCalledWith(TEST_NODE)
      expect(self.logger.setVerboseLogging).toHaveBeenCalledWith(false)
      expect(self.proxy.getHandlers).toHaveBeenCalled()
      expect(self.utils.dropPartialMatches).toHaveBeenCalledWith(TEST_HANDLERS, TEST_HANDLERS_TO_DISABLE)
      expect(self.proxy.listHandlers).not.toHaveBeenCalledWith(TEST_NODE)
      expect(self.endPointTransceiver.init).toHaveBeenCalledWith(TEST_NODE, "admin", "admin", undefined, undefined, undefined)
      expect(self.optionsUtils.getPassword).toHaveBeenCalledWith("admin")
      expect(self.optionsUtils.getApplicationKey).toHaveBeenCalledWith(undefined)
      expect(self.proxy.startProxyDaemon).toHaveBeenCalledWith(TEST_NODE, TEST_PORT, false, TEST_HANDLERS_AFTER_DISABLE)
      done()
    })
  })

})
