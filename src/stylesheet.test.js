const rewire = require("rewire")
const stylesheet = rewire("./stylesheet")
const Rule = stylesheet.__get__("Rule")

const ruleComparator = stylesheet.__get__("ruleComparator")
const mergeTo = stylesheet.__get__("mergeTo")
const shallowClone = stylesheet.__get__("shallowClone")
// @ponicode
describe("getKey", () => {
    let object
    let inst

    beforeEach(() => {
        object = [["Anas", "Edmond", "George"], ["Anas", "Anas", "Anas"], ["Pierre Edouard", "Edmond", "George"]]
        inst = new Rule("%s > option", { props: object, style: "Jean-Philippe", mixins: "Pierre Edouard" }, 3)
    })

    test("0", () => {
        let callFunction = () => {
            inst.getKey()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("getSelector", () => {
    let object
    let inst

    beforeEach(() => {
        object = [["Jean-Philippe", "Edmond", "Michael"], ["Anas", "Jean-Philippe", "Jean-Philippe"], ["Anas", "Edmond", "Anas"]]
        inst = new Rule("--selector=%s", { props: object, style: "Edmond", mixins: "Michael" }, 2)
    })

    test("0", () => {
        let callFunction = () => {
            inst.getSelector()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("getRank", () => {
    let object
    let inst

    beforeEach(() => {
        object = [["Pierre Edouard", "Pierre Edouard", "George"], ["Edmond", "George", "George"], ["Michael", "Pierre Edouard", "George"]]
        inst = new Rule("len", { props: object, style: "Anas", mixins: "Anas" }, 80)
    })

    test("0", () => {
        let callFunction = () => {
            inst.getRank()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("getOrder", () => {
    let object
    let inst

    beforeEach(() => {
        object = [["Jean-Philippe", "Edmond", "George"], ["Jean-Philippe", "Pierre Edouard", "Edmond"], ["George", "George", "Michael"]]
        inst = new Rule("*", { props: object, style: "Edmond", mixins: "Edmond" }, 0)
    })

    test("0", () => {
        let callFunction = () => {
            inst.getOrder()
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("matchContext", () => {
    let object
    let inst

    beforeEach(() => {
        object = [["Pierre Edouard", "Edmond", "Michael"], ["George", "Edmond", "George"], ["Jean-Philippe", "Pierre Edouard", "Pierre Edouard"]]
        inst = new Rule("len", { props: object, style: "Pierre Edouard", mixins: "Jean-Philippe" }, 0)
    })

    test("0", () => {
        let callFunction = () => {
            inst.matchContext({ key: "Dillenberg" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            inst.matchContext({ key: "elio@example.com" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            inst.matchContext({ key: "Elio" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            inst.matchContext(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("ruleComparator", () => {
    test("0", () => {
        let callFunction = () => {
            ruleComparator({ getRank: () => 1, getOrder: () => "completed" }, { getRank: () => 2, getOrder: () => "processing" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            ruleComparator({ getRank: () => 1, getOrder: () => "processing" }, { getRank: () => 80, getOrder: () => "processing" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            ruleComparator({ getRank: () => 2, getOrder: () => "completed" }, { getRank: () => 80, getOrder: () => "canceled" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            ruleComparator({ getRank: () => 3, getOrder: () => "done" }, { getRank: () => 3, getOrder: () => "completed" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            ruleComparator({ getRank: () => 0, getOrder: () => "completed" }, { getRank: () => 2, getOrder: () => "completed" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            ruleComparator({ getRank: () => Infinity, getOrder: () => "" }, undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("mergeTo", () => {
    test("0", () => {
        let callFunction = () => {
            mergeTo(["data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20width%3D%22undefined%22%20height%3D%22undefined%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22grey%22%2F%3E%3Ctext%20x%3D%22NaN%22%20y%3D%22NaN%22%20font-size%3D%2220%22%20alignment-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Eundefinedxundefined%3C%2Ftext%3E%3C%2Fsvg%3E", "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20width%3D%22undefined%22%20height%3D%22undefined%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22grey%22%2F%3E%3Ctext%20x%3D%22NaN%22%20y%3D%22NaN%22%20font-size%3D%2220%22%20alignment-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Eundefinedxundefined%3C%2Ftext%3E%3C%2Fsvg%3E", "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20width%3D%22undefined%22%20height%3D%22undefined%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22grey%22%2F%3E%3Ctext%20x%3D%22NaN%22%20y%3D%22NaN%22%20font-size%3D%2220%22%20alignment-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Eundefinedxundefined%3C%2Ftext%3E%3C%2Fsvg%3E"], "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20width%3D%22undefined%22%20height%3D%22undefined%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22grey%22%2F%3E%3Ctext%20x%3D%22NaN%22%20y%3D%22NaN%22%20font-size%3D%2220%22%20alignment-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Eundefinedxundefined%3C%2Ftext%3E%3C%2Fsvg%3E")
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            mergeTo(undefined, undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("shallowClone", () => {
    test("0", () => {
        let param1 = [["George", "Michael", "Edmond"], ["Edmond", "Michael", "Pierre Edouard"], ["Edmond", "George", "Anas"]]
        let callFunction = () => {
            shallowClone(param1)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let param1 = [["Michael", "Michael", "Edmond"], ["George", "Michael", "George"], ["Jean-Philippe", "Anas", "Michael"]]
        let callFunction = () => {
            shallowClone(param1)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let param1 = [["Anas", "Michael", "George"], ["Jean-Philippe", "George", "Pierre Edouard"], ["George", "Pierre Edouard", "Michael"]]
        let callFunction = () => {
            shallowClone(param1)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let param1 = [["Anas", "Anas", "Michael"], ["Edmond", "Michael", "Anas"], ["Anas", "Edmond", "Jean-Philippe"]]
        let callFunction = () => {
            shallowClone(param1)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let param1 = [["Edmond", "Edmond", "Pierre Edouard"], ["Edmond", "Pierre Edouard", "Anas"], ["Jean-Philippe", "Jean-Philippe", "George"]]
        let callFunction = () => {
            shallowClone(param1)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            shallowClone(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("addDefaultRules", () => {
    let inst

    beforeEach(() => {
        inst = new stylesheet.default()
    })

    test("0", () => {
        let callFunction = () => {
            inst.addDefaultRules(["value-added", "value-added", "4th generation"])
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            inst.addDefaultRules(["logistical", "logistical", "methodical"])
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            inst.addDefaultRules(["value-added", "methodical", "methodical"])
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            inst.addDefaultRules(["dedicated", "methodical", "4th generation"])
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            inst.addDefaultRules(["logistical", "value-added", "value-added"])
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            inst.addDefaultRules(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("addRules", () => {
    let inst

    beforeEach(() => {
        inst = new stylesheet.default()
    })

    test("0", () => {
        let callFunction = () => {
            inst.addRules(["dedicated", "value-added", "dedicated"])
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            inst.addRules(["4th generation", "4th generation", "value-added"])
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            inst.addRules(["4th generation", "dedicated", "4th generation"])
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            inst.addRules(["logistical", "methodical", "methodical"])
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            inst.addRules(["methodical", "value-added", "4th generation"])
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            inst.addRules(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("addDefaultRule", () => {
    let inst

    beforeEach(() => {
        inst = new stylesheet.default()
    })

    test("0", () => {
        let param2 = [["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"]]
        let callFunction = () => {
            inst.addDefaultRule("--selector=%s", param2)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let param2 = [["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"]]
        let callFunction = () => {
            inst.addDefaultRule("*", param2)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let param2 = [["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"]]
        let callFunction = () => {
            inst.addDefaultRule("len", param2)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let param2 = [["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"]]
        let callFunction = () => {
            inst.addDefaultRule("kind", param2)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let param2 = [["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"]]
        let callFunction = () => {
            inst.addDefaultRule("%s > option", param2)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            inst.addDefaultRule(undefined, undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("addRule", () => {
    let inst

    beforeEach(() => {
        inst = new stylesheet.default()
    })

    test("0", () => {
        let param2 = [["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"]]
        let callFunction = () => {
            inst.addRule("*", param2)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let param2 = [["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"]]
        let callFunction = () => {
            inst.addRule("--selector=%s", param2)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let param2 = [["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"]]
        let callFunction = () => {
            inst.addRule("%s > option", param2)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let param2 = [["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"]]
        let callFunction = () => {
            inst.addRule("len", param2)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let param2 = [["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"]]
        let callFunction = () => {
            inst.addRule("kind", param2)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            inst.addRule(undefined, undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("_addRule", () => {
    let inst

    beforeEach(() => {
        inst = new stylesheet.default()
    })

    test("0", () => {
        let param2 = [["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"]]
        let callFunction = () => {
            inst._addRule("*", param2, 80)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let param2 = [["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"]]
        let callFunction = () => {
            inst._addRule("kind", param2, 1)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let param2 = [["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"]]
        let callFunction = () => {
            inst._addRule("%s > option", param2, 80)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let param2 = [["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"]]
        let callFunction = () => {
            inst._addRule("%s > option", param2, 0)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let param2 = [["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"], ["reply_click()", "reply_click()", "reply_click()"]]
        let callFunction = () => {
            inst._addRule("%s > option", param2, 2)
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            inst._addRule("", [], Infinity)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("getProps", () => {
    let inst

    beforeEach(() => {
        inst = new stylesheet.default()
    })

    test("0", () => {
        let object = [[false, true, true], [true, false, true], [false, true, false]]
        let callFunction = () => {
            inst.getProps({ props: object })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let object = [[true, false, false], [true, false, true], [false, true, true]]
        let callFunction = () => {
            inst.getProps({ props: object })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let object = [[false, true, false], [true, false, false], [true, false, false]]
        let callFunction = () => {
            inst.getProps({ props: object })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let object = [[true, true, false], [false, true, true], [true, true, false]]
        let callFunction = () => {
            inst.getProps({ props: object })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let object = [[false, true, true], [true, false, true], [false, false, false]]
        let callFunction = () => {
            inst.getProps({ props: object })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            inst.getProps(undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})

// @ponicode
describe("collectRules", () => {
    let inst

    beforeEach(() => {
        inst = new stylesheet.default()
    })

    test("0", () => {
        let callFunction = () => {
            inst.collectRules([true, false, true], { getName: () => "Maurice Purdy", getParent: () => "Gail Hoppe", getStyleSheet: () => "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20width%3D%22undefined%22%20height%3D%22undefined%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22grey%22%2F%3E%3Ctext%20x%3D%22NaN%22%20y%3D%22NaN%22%20font-size%3D%2220%22%20alignment-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Eundefinedxundefined%3C%2Ftext%3E%3C%2Fsvg%3E" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("1", () => {
        let callFunction = () => {
            inst.collectRules([false, false, true], { getName: () => "Ronald Keeling", getParent: () => "Ronald Keeling", getStyleSheet: () => "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20width%3D%22undefined%22%20height%3D%22undefined%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22grey%22%2F%3E%3Ctext%20x%3D%22NaN%22%20y%3D%22NaN%22%20font-size%3D%2220%22%20alignment-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Eundefinedxundefined%3C%2Ftext%3E%3C%2Fsvg%3E" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("2", () => {
        let callFunction = () => {
            inst.collectRules([true, true, false], { getName: () => "Becky Bednar", getParent: () => "Gail Hoppe", getStyleSheet: () => "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20width%3D%22undefined%22%20height%3D%22undefined%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22grey%22%2F%3E%3Ctext%20x%3D%22NaN%22%20y%3D%22NaN%22%20font-size%3D%2220%22%20alignment-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Eundefinedxundefined%3C%2Ftext%3E%3C%2Fsvg%3E" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("3", () => {
        let callFunction = () => {
            inst.collectRules([false, false, false], { getName: () => "Ronald Keeling", getParent: () => "Becky Bednar", getStyleSheet: () => "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20width%3D%22undefined%22%20height%3D%22undefined%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22grey%22%2F%3E%3Ctext%20x%3D%22NaN%22%20y%3D%22NaN%22%20font-size%3D%2220%22%20alignment-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Eundefinedxundefined%3C%2Ftext%3E%3C%2Fsvg%3E" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("4", () => {
        let callFunction = () => {
            inst.collectRules([false, false, false], { getName: () => "Gail Hoppe", getParent: () => "Gail Hoppe", getStyleSheet: () => "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20width%3D%22undefined%22%20height%3D%22undefined%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22grey%22%2F%3E%3Ctext%20x%3D%22NaN%22%20y%3D%22NaN%22%20font-size%3D%2220%22%20alignment-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%3Eundefinedxundefined%3C%2Ftext%3E%3C%2Fsvg%3E" })
        }
    
        expect(callFunction).not.toThrow()
    })

    test("5", () => {
        let callFunction = () => {
            inst.collectRules(undefined, undefined)
        }
    
        expect(callFunction).not.toThrow()
    })
})
