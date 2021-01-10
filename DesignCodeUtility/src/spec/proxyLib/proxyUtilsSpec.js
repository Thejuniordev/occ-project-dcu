const mockery = require('../mockery')

describe("CC Proxy Utils", () => {

  const self = this
  const TEST_FILE_PATH = "testFile.txt"
  const TEST_RESOURCE_NAME = "testResource"
  const TEST_FILE_CONTENTS = "This is a test"

  //=========================
  // Set up and tear down
  //=========================

  beforeEach(() => {

    mockery.use(jasmine.createSpy)
    
    // Mock dependent modules
    mockery.mockModules(self, "../logger", "../utils")
 
    // Set up the module to be tested
    self.proxyUtils = mockery.require("../../proxyLib/proxyUtils")
  })

  afterEach(mockery.stopAll)
  
  //=========================
  // Test cases
  //=========================
  
  it("Should warn that mapped file not found", () => {
    
    // Run test: null value expected
    expect(self.proxyUtils.substituteLocalFileContents(TEST_RESOURCE_NAME, TEST_FILE_PATH)).toBeNull()

    // Verify use of mocks
    expect(self.utils.exists).toHaveBeenCalledWith(TEST_FILE_PATH)
    expect(self.logger.warn).toHaveBeenCalledWith("mappedFileNotFoundWarning", {resource: TEST_RESOURCE_NAME, path: TEST_FILE_PATH})
  })

  it("Should read file", () => {
    // Set up for the test
    self.utils.exists.returns(true)
    self.utils.readFile.returns(TEST_FILE_CONTENTS)

    // Run the test: file contents expected
    expect(self.proxyUtils.substituteLocalFileContents(TEST_RESOURCE_NAME, TEST_FILE_PATH)).toEqual(TEST_FILE_CONTENTS)

    // Verify use of mocks
    expect(self.utils.exists).toHaveBeenCalledWith(TEST_FILE_PATH)
    expect(self.logger.debug).toHaveBeenCalledWith("doResourceSubstitutionMessage", {resource: TEST_RESOURCE_NAME, path: TEST_FILE_PATH})
    expect(self.utils.readFile).toHaveBeenCalledWith(TEST_FILE_PATH)
  })


})
