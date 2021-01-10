const constants = require('../../../constants').constants
const mockery = require('../../mockery')

describe("Global Element Rule Tests", () => {

  const self = this

  //=========================
  // Set up and tear down
  //=========================

  beforeEach(() => {

    mockery.use(jasmine.createSpy)
    
    // Mock dependent modules
    mockery.mockModules(self, "../metadata", "../utils", "../logger", "../proxyLib/datamaps", "path", "xregexp")

    // Set up the module to be tested
    self.moduleUnderTest = mockery.require("../../../proxyLib/rules/template.3.rule")

    self.abc = "abc"
  })


  afterEach(mockery.stopAll)

  //=========================
  // Test cases
  //=========================

  it("Verify name, doc and rule", () => {
    expect(self.moduleUnderTest.name).toEqual("GlobalElementTemplate")
    expect(self.moduleUnderTest.doc).toEqual("Handler for global element templates")
    expect(self.moduleUnderTest.rule).toEqual({
      method: 'GET',
      phase: 'response',
      fullUrl: "__NODE__/ccstoreui/v1/pages/layout/:id*",
      mimeType: 'application/json',
      as: 'json'
    })
  })

  // Setting up tests for handler method is quite complex and may benefit 
  // from refactoring of source module to break up the work into smaller 
  // functions. This is left as a future exercise

})
