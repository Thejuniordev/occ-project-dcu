const constants = require('../../constants').constants
const mockery = require('../mockery')

describe("CCProxy Data Maps", () => {

  const self = this
  const TEST_NAME1  = "someName"
  const TEST_VALUE1 = "someValue"
  const TEST_NAME2  = "anotherName"
  const TEST_VALUE2 = "anotherValue"

  //=========================
  // Set up and tear down
  //=========================

  beforeEach(() => {

    mockery.use(jasmine.createSpy)
    
    // Mock dependent modules
    mockery.mockModules(self, "../utils", "../metadata")

    self.utils.readJsonFile.returns({})
    self.utils.sanitizeName.returnsFirstArg()
 
    // Set up the module to be tested
    self.dataMaps = mockery.require("../../proxyLib/datamaps")
  })

  afterEach(mockery.stopAll)
  
  //=========================
  // Test cases
  //=========================

  it("Verify that widget map is empty", () => {
    
    // Call widget without a name: should return  map
    expect(self.dataMaps.widget(null)).toEqual({})
    expect(self.dataMaps.widget(TEST_NAME1)).toBeUndefined()
    expect(self.dataMaps.widget(TEST_NAME2)).toBeUndefined()
  })

  it("Verify that widget map can be populated", () => {
    
    // Call widget with first name and value: returns value
    expect(self.dataMaps.widget(TEST_NAME1, TEST_VALUE1)).toEqual(TEST_VALUE1)

    // Check that there is just an entry for the first name
    expect(self.dataMaps.widget(TEST_NAME1)).toEqual(TEST_VALUE1)
    expect(self.dataMaps.widget(TEST_NAME2)).toBeUndefined()
    expect(self.dataMaps.widget(null)).toEqual({someName: TEST_VALUE1})

    // Populate second widget name
    expect(self.dataMaps.widget(TEST_NAME2, TEST_VALUE2)).toEqual(TEST_VALUE2)

    // Check that there are entries for both names now
    expect(self.dataMaps.widget(TEST_NAME1)).toEqual(TEST_VALUE1)
    expect(self.dataMaps.widget(TEST_NAME2)).toEqual(TEST_VALUE2)
    expect(self.dataMaps.widget(null)).toEqual({someName: TEST_VALUE1, anotherName: TEST_VALUE2})

    // Swap the values
    expect(self.dataMaps.widget(TEST_NAME1, TEST_VALUE2)).toEqual(TEST_VALUE2)
    expect(self.dataMaps.widget(TEST_NAME2, TEST_VALUE1)).toEqual(TEST_VALUE1)

    // Check that there are entries for both names now
    expect(self.dataMaps.widget(TEST_NAME1)).toEqual(TEST_VALUE2)
    expect(self.dataMaps.widget(TEST_NAME2)).toEqual(TEST_VALUE1)
    expect(self.dataMaps.widget(null)).toEqual({someName: TEST_VALUE2, anotherName: TEST_VALUE1})
  })


  it("Verify that element map is empty", () => {
    
    // Call element without a name: should return  map
    expect(self.dataMaps.element(null)).toEqual({})
    expect(self.dataMaps.element(TEST_NAME1)).toBeUndefined()
    expect(self.dataMaps.element(TEST_NAME2)).toBeUndefined()
  })

  it("Verify that element map can be populated", () => {
    
    // Call element with first name and value: returns value
    expect(self.dataMaps.element(TEST_NAME1, TEST_VALUE1)).toEqual(TEST_VALUE1)

    // Check that there is just an entry for the first name
    expect(self.dataMaps.element(TEST_NAME1)).toEqual(TEST_VALUE1)
    expect(self.dataMaps.element(TEST_NAME2)).toBeUndefined()
    expect(self.dataMaps.element(null)).toEqual({someName: TEST_VALUE1})

    // Populate second element name
    expect(self.dataMaps.element(TEST_NAME2, TEST_VALUE2)).toEqual(TEST_VALUE2)

    // Check that there are entries for both names now
    expect(self.dataMaps.element(TEST_NAME1)).toEqual(TEST_VALUE1)
    expect(self.dataMaps.element(TEST_NAME2)).toEqual(TEST_VALUE2)
    expect(self.dataMaps.element(null)).toEqual({someName: TEST_VALUE1, anotherName: TEST_VALUE2})

    // Swap the values
    expect(self.dataMaps.element(TEST_NAME1, TEST_VALUE2)).toEqual(TEST_VALUE2)
    expect(self.dataMaps.element(TEST_NAME2, TEST_VALUE1)).toEqual(TEST_VALUE1)

    // Check that there are entries for both names now
    expect(self.dataMaps.element(TEST_NAME1)).toEqual(TEST_VALUE2)
    expect(self.dataMaps.element(TEST_NAME2)).toEqual(TEST_VALUE1)
    expect(self.dataMaps.element(null)).toEqual({someName: TEST_VALUE2, anotherName: TEST_VALUE1})
  })


  it("Verify that stack map is empty", () => {
    
    // Call stack without a name: should return  map
    expect(self.dataMaps.stack(null)).toEqual({})
    expect(self.dataMaps.stack(TEST_NAME1)).toBeUndefined()
    expect(self.dataMaps.stack(TEST_NAME2)).toBeUndefined()
  })

  it("Verify that stack map can be populated", () => {
    
    // Call stack with first name and value: returns value
    expect(self.dataMaps.stack(TEST_NAME1, TEST_VALUE1)).toEqual(TEST_VALUE1)

    // Check that there is just an entry for the first name
    expect(self.dataMaps.stack(TEST_NAME1)).toEqual(TEST_VALUE1)
    expect(self.dataMaps.stack(TEST_NAME2)).toBeUndefined()
    expect(self.dataMaps.stack(null)).toEqual({someName: TEST_VALUE1})

    // Populate second stack name
    expect(self.dataMaps.stack(TEST_NAME2, TEST_VALUE2)).toEqual(TEST_VALUE2)

    // Check that there are entries for both names now
    expect(self.dataMaps.stack(TEST_NAME1)).toEqual(TEST_VALUE1)
    expect(self.dataMaps.stack(TEST_NAME2)).toEqual(TEST_VALUE2)
    expect(self.dataMaps.stack(null)).toEqual({someName: TEST_VALUE1, anotherName: TEST_VALUE2})

    // Swap the values
    expect(self.dataMaps.stack(TEST_NAME1, TEST_VALUE2)).toEqual(TEST_VALUE2)
    expect(self.dataMaps.stack(TEST_NAME2, TEST_VALUE1)).toEqual(TEST_VALUE1)

    // Check that there are entries for both names now
    expect(self.dataMaps.stack(TEST_NAME1)).toEqual(TEST_VALUE2)
    expect(self.dataMaps.stack(TEST_NAME2)).toEqual(TEST_VALUE1)
    expect(self.dataMaps.stack(null)).toEqual({someName: TEST_VALUE2, anotherName: TEST_VALUE1})
  })


  it("Verify that media map is empty", () => {
    
    // Call media without a name: should return  map
    expect(self.dataMaps.media(null)).toEqual({})
    expect(self.dataMaps.media(TEST_NAME1)).toBeUndefined()
    expect(self.dataMaps.media(TEST_NAME2)).toBeUndefined()
  })

  it("Verify that media map can be populated", () => {
    
    // Call media with first name and value: returns value
    expect(self.dataMaps.media(TEST_NAME1, TEST_VALUE1)).toEqual(TEST_VALUE1)

    // Check that there is just an entry for the first name
    expect(self.dataMaps.media(TEST_NAME1)).toEqual(TEST_VALUE1)
    expect(self.dataMaps.media(TEST_NAME2)).toBeUndefined()
    expect(self.dataMaps.media(null)).toEqual({someName: TEST_VALUE1})

    // Populate second media name
    expect(self.dataMaps.media(TEST_NAME2, TEST_VALUE2)).toEqual(TEST_VALUE2)

    // Check that there are entries for both names now
    expect(self.dataMaps.media(TEST_NAME1)).toEqual(TEST_VALUE1)
    expect(self.dataMaps.media(TEST_NAME2)).toEqual(TEST_VALUE2)
    expect(self.dataMaps.media(null)).toEqual({someName: TEST_VALUE1, anotherName: TEST_VALUE2})

    // Swap the values
    expect(self.dataMaps.media(TEST_NAME1, TEST_VALUE2)).toEqual(TEST_VALUE2)
    expect(self.dataMaps.media(TEST_NAME2, TEST_VALUE1)).toEqual(TEST_VALUE1)

    // Check that there are entries for both names now
    expect(self.dataMaps.media(TEST_NAME1)).toEqual(TEST_VALUE2)
    expect(self.dataMaps.media(TEST_NAME2)).toEqual(TEST_VALUE1)
    expect(self.dataMaps.media(null)).toEqual({someName: TEST_VALUE2, anotherName: TEST_VALUE1})
  })

  it("Build data maps with nothing to map", () => {
    // Set up for the test
    self.utils.glob.returns([])

    // Run test
    self.dataMaps.buildDataMaps()

    // Verify the resulting maps
    expect(self.dataMaps.widget(null)).toEqual({})
    expect(self.dataMaps.element(null)).toEqual({})
    expect(self.dataMaps.stack(null)).toEqual({})
    expect(self.dataMaps.media(null)).toEqual({})

    // Verify use of mocks
    expect(self.metadata.cacheWidgetInstances).toHaveBeenCalledTimes(1)
    expect(self.utils.glob).toHaveBeenCalledTimes(4)
    expect(self.utils.glob).toHaveBeenCalledWith(`${constants.trackingDir}/${constants.widgetsDir}/**/${constants.widgetMetadataJson}`)
    expect(self.utils.glob).toHaveBeenCalledWith(`${constants.trackingDir}/widget/**/${constants.elementMetadataJson}`)
    expect(self.utils.glob).toHaveBeenCalledWith(`${constants.trackingDir}/${constants.stacksDir}/**/${constants.stackMetadataJson}`)
    expect(self.utils.glob).toHaveBeenCalledWith(`${constants.trackingDir}/${constants.elementsDir}/**/${constants.elementMetadataJson}`)
    expect(self.utils.readJsonFile).not.toHaveBeenCalled()
    expect(self.utils.sanitizeName).not.toHaveBeenCalled()
  })

  it("Build data maps with widgets to map", () => {
    // Set up widget enumeration
    self.utils.glob.and.callFake(path => {

      if (path == `${constants.trackingDir}/${constants.widgetsDir}/**/${constants.widgetMetadataJson}`) {
        return ['widget/firstWidget/widget.json', 'widget/secondWidget/widget.json']
      }

      return []
    })

    // Set up reading of json files
    self.utils.readJsonFile.and.callFake(path => {
      if (path == 'widget/firstWidget/widget.json') {
        return { widgetType: "firstWidget", displayName: "Alpha Widget" }
      }
      else if (path == 'widget/secondWidget/widget.json') {
        return { widgetType: "secondWidget", displayName: "Beta Widget" }
      }
      else {
        return {}
      }
    })

    // Run test
    self.dataMaps.buildDataMaps()

    // Verify the resulting maps
    expect(self.dataMaps.widget(null)).toEqual({firstWidget: "widget/Alpha Widget", secondWidget: "widget/Beta Widget"})
    expect(self.dataMaps.element(null)).toEqual({})
    expect(self.dataMaps.stack(null)).toEqual({})
    expect(self.dataMaps.media(null)).toEqual({})

    // Verify use of mocks
    expect(self.metadata.cacheWidgetInstances).toHaveBeenCalledTimes(1)
    expect(self.utils.glob).toHaveBeenCalledTimes(4)
    expect(self.utils.glob).toHaveBeenCalledWith(`${constants.trackingDir}/${constants.widgetsDir}/**/${constants.widgetMetadataJson}`)
    expect(self.utils.glob).toHaveBeenCalledWith(`${constants.trackingDir}/widget/**/${constants.elementMetadataJson}`)
    expect(self.utils.glob).toHaveBeenCalledWith(`${constants.trackingDir}/${constants.stacksDir}/**/${constants.stackMetadataJson}`)
    expect(self.utils.glob).toHaveBeenCalledWith(`${constants.trackingDir}/${constants.elementsDir}/**/${constants.elementMetadataJson}`)
    expect(self.utils.readJsonFile).toHaveBeenCalledTimes(2)
    expect(self.utils.readJsonFile).toHaveBeenCalledWith('widget/firstWidget/widget.json')
    expect(self.utils.readJsonFile).toHaveBeenCalledWith('widget/secondWidget/widget.json')
    expect(self.utils.sanitizeName).toHaveBeenCalledTimes(2)
    expect(self.utils.sanitizeName).toHaveBeenCalledWith("Alpha Widget")
    expect(self.utils.sanitizeName).toHaveBeenCalledWith("Beta Widget")
  })

  it("Build data maps with widget elements to map", () => {
    // Set up widget enumeration
    self.utils.glob.and.callFake(path => {
      if (path == `${constants.trackingDir}/${constants.widgetsDir}/**/${constants.elementMetadataJson}`) {
        return [
          '.ccc/widget/firstWidget/element/elementOne/element.json', 
          'abc/def/.ccc/widget/secondWidget/element/elementTwo/element.json', 
          '.ccc/widget/thirdWidget/version/three/element/elementThree/element.json',
          '.ccc/widget/fourthWidget/bad/element/elementFour/element.json'
        ]
      }

      return []
    })

    // Set up reading of json files
    self.utils.readJsonFile.and.callFake(path => {
      switch (path) {
        case '.ccc/widget/firstWidget/element/elementOne/element.json':
          return {tag: "firstElement"}
          break
        case 'abc/def/.ccc/widget/secondWidget/element/elementTwo/element.json':
          return {tag: "secondElement"}
          break
        case '.ccc/widget/thirdWidget/version/three/element/elementThree/element.json':
          return {tag: "thirdElement"}
          break
        case '.ccc/widget/fourthWidget/bad/element/elementFour/element.json':
          return {tag: "fourthElement"}
          break
        default:
          return {}
          break
      }
    })

    // Run test
    self.dataMaps.buildDataMaps()

    // Verify the resulting maps
    expect(self.dataMaps.widget(null)).toEqual({})
    expect(self.dataMaps.element(null)).toEqual({firstElement: "widget/firstWidget/element/elementOne", secondElement: "widget/secondWidget/element/elementTwo",thirdElement: "widget/thirdWidget/element/elementThree"})
    expect(self.dataMaps.stack(null)).toEqual({})
    expect(self.dataMaps.media(null)).toEqual({})

    // Verify use of mocks
    expect(self.metadata.cacheWidgetInstances).toHaveBeenCalledTimes(1)
    expect(self.utils.glob).toHaveBeenCalledTimes(4)
    expect(self.utils.glob).toHaveBeenCalledWith(`${constants.trackingDir}/${constants.widgetsDir}/**/${constants.widgetMetadataJson}`)
    expect(self.utils.glob).toHaveBeenCalledWith(`${constants.trackingDir}/widget/**/${constants.elementMetadataJson}`)
    expect(self.utils.glob).toHaveBeenCalledWith(`${constants.trackingDir}/${constants.stacksDir}/**/${constants.stackMetadataJson}`)
    expect(self.utils.glob).toHaveBeenCalledWith(`${constants.trackingDir}/${constants.elementsDir}/**/${constants.elementMetadataJson}`)
    expect(self.utils.readJsonFile).toHaveBeenCalledTimes(4)
    expect(self.utils.readJsonFile).toHaveBeenCalledWith('.ccc/widget/firstWidget/element/elementOne/element.json')
    expect(self.utils.readJsonFile).toHaveBeenCalledWith('abc/def/.ccc/widget/secondWidget/element/elementTwo/element.json')
    expect(self.utils.readJsonFile).toHaveBeenCalledWith('.ccc/widget/thirdWidget/version/three/element/elementThree/element.json')
    expect(self.utils.readJsonFile).toHaveBeenCalledWith('.ccc/widget/fourthWidget/bad/element/elementFour/element.json')
    expect(self.utils.sanitizeName).not.toHaveBeenCalled()
  })

  it("Build data maps with stacks to map", () => {
    // Set up widget enumeration
    self.utils.glob.and.callFake(path => {
      if (path == `${constants.trackingDir}/${constants.stacksDir}/**/${constants.stackMetadataJson}`) {
        return [
          '.ccc/stack/stack.json', 
          '.ccc/stack/stackOne/stack.json'        
        ]
      }

      return []
    })

    // Set up reading of json files
    self.utils.readJsonFile.and.callFake(path => {
      switch (path) {
        case '.ccc/stack/stack.json':
          return {stackType: "zeroStack"}
          break
        case '.ccc/stack/stackOne/stack.json':
          return {stackType: "firstStack"}
          break
        default:
          return {}
          break
      }
    })

    // Run test
    self.dataMaps.buildDataMaps()

    // Verify the resulting maps
    expect(self.dataMaps.widget(null)).toEqual({})
    expect(self.dataMaps.element(null)).toEqual({})
    expect(self.dataMaps.stack(null)).toEqual({ firstStack: "stack/stackOne", zeroStack: "stack/stack.json"})
    expect(self.dataMaps.media(null)).toEqual({})

    // Verify use of mocks
    expect(self.metadata.cacheWidgetInstances).toHaveBeenCalledTimes(1)
    expect(self.utils.glob).toHaveBeenCalledTimes(4)
    expect(self.utils.glob).toHaveBeenCalledWith(`${constants.trackingDir}/${constants.widgetsDir}/**/${constants.widgetMetadataJson}`)
    expect(self.utils.glob).toHaveBeenCalledWith(`${constants.trackingDir}/widget/**/${constants.elementMetadataJson}`)
    expect(self.utils.glob).toHaveBeenCalledWith(`${constants.trackingDir}/${constants.stacksDir}/**/${constants.stackMetadataJson}`)
    expect(self.utils.glob).toHaveBeenCalledWith(`${constants.trackingDir}/${constants.elementsDir}/**/${constants.elementMetadataJson}`)
    expect(self.utils.readJsonFile).toHaveBeenCalledTimes(2)
    expect(self.utils.readJsonFile).toHaveBeenCalledWith('.ccc/stack/stack.json')
    expect(self.utils.readJsonFile).toHaveBeenCalledWith('.ccc/stack/stackOne/stack.json')
    expect(self.utils.sanitizeName).not.toHaveBeenCalled()
  })

  it("Build data maps with global elements to map", () => {
    // Set up widget enumeration
    self.utils.glob.and.callFake(path => {
      if (path == `${constants.trackingDir}/${constants.elementsDir}/**/${constants.elementMetadataJson}`) {
        return [
          '.ccc/element/element.json', 
          '.ccc/element/elementOne/element.json'        
        ]
      }

      return []
    })

    // Set up reading of json files
    self.utils.readJsonFile.and.callFake(path => {
      switch (path) {
        case '.ccc/element/element.json':
          return {tag: "zeroElement"}
          break
        case '.ccc/element/elementOne/element.json':
          return {tag: "firstElement"}
          break
        default:
          return {}
          break
      }
    })

    // Run test
    self.dataMaps.buildDataMaps()

    // Verify the resulting maps
    expect(self.dataMaps.widget(null)).toEqual({})
    expect(self.dataMaps.element(null)).toEqual({ firstElement: "element/elementOne", zeroElement: "element/element.json"})
    expect(self.dataMaps.stack(null)).toEqual({})
    expect(self.dataMaps.media(null)).toEqual({})

    // Verify use of mocks
    expect(self.metadata.cacheWidgetInstances).toHaveBeenCalledTimes(1)
    expect(self.utils.glob).toHaveBeenCalledTimes(4)
    expect(self.utils.glob).toHaveBeenCalledWith(`${constants.trackingDir}/${constants.widgetsDir}/**/${constants.widgetMetadataJson}`)
    expect(self.utils.glob).toHaveBeenCalledWith(`${constants.trackingDir}/widget/**/${constants.elementMetadataJson}`)
    expect(self.utils.glob).toHaveBeenCalledWith(`${constants.trackingDir}/${constants.stacksDir}/**/${constants.stackMetadataJson}`)
    expect(self.utils.glob).toHaveBeenCalledWith(`${constants.trackingDir}/${constants.elementsDir}/**/${constants.elementMetadataJson}`)
    expect(self.utils.readJsonFile).toHaveBeenCalledTimes(2)
    expect(self.utils.readJsonFile).toHaveBeenCalledWith('.ccc/element/element.json')
    expect(self.utils.readJsonFile).toHaveBeenCalledWith('.ccc/element/elementOne/element.json')
    expect(self.utils.sanitizeName).not.toHaveBeenCalled()
  })

})
