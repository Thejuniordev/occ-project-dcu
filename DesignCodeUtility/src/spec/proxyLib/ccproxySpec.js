const constants = require('../../constants').constants
const mockery = require('../mockery')

describe("CCProxy", () => {

  const self = this
  const TEST_FIRST_RULE_FILE_NAME = "first.rule.js"
  const TEST_SECOND_RULE_FILE_NAME = "second.rule.js"
  const TEST_NODE = "http://somehost:8090"
  const TEST_PORT = 4040

  //=========================
  // Set up and tear down
  //=========================

  beforeEach(() => {

    mockery.use(jasmine.createSpy)
    
    // Mock dependent modules
    mockery.mockModules(self, "../logger","../proxyLib/datamaps")

    // Set up the module to be tested
    self.ccproxy = mockery.require("../../proxyLib/ccproxy")
  })


  afterEach(mockery.stopAll)

  
  //=========================
  // Test cases
  //=========================

  it("Verify getHandlers", () => {

    // Run the test
    // ccproxy uses __dirname so expected results are actual rule handler names
    expect(self.ccproxy.getHandlers()).toEqual([
      "Javascript", 
      "SourceMedia (Page)", 
      "SourceMedia (Contents)",
      "StackTemplate",
      "WidgetTemplate",
      "WidgetElementTemplate",
      "GlobalElementTemplate",
      "GlobalTextSnippets",
      "ThemeCSS",
      "WidgetTextSnippets"
    ])
  })



})
