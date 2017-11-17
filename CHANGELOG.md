# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.2.1"></a>
## [0.2.1](https://github.com/vovkasm/react-native-stylable/compare/v0.2.0...v0.2.1) (2017-11-17)


### Bug Fixes

* Allow to wrap host components in stylable ([f89fc5e](https://github.com/vovkasm/react-native-stylable/commit/f89fc5e))
* Remove hack that no more work with React 16+ ([89528e0](https://github.com/vovkasm/react-native-stylable/commit/89528e0))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/vovkasm/react-native-stylable/compare/v0.1.0...v0.2.0) (2017-08-09)


### Bug Fixes

* fix getting proper name of component ([f037042](https://github.com/vovkasm/react-native-stylable/commit/f037042))


### Features

* package only needed files ([a9e55a1](https://github.com/vovkasm/react-native-stylable/commit/a9e55a1))
* Use better naming for components ([8b063b3](https://github.com/vovkasm/react-native-stylable/commit/8b063b3))



<a name="0.1.0"></a>
# [0.1.0](https://github.com/vovkasm/react-native-stylable/compare/0.0.5...v0.1.0) (2017-06-24)


### Bug Fixes

* make getDisplayName to be almost equal to react getElementName ([6449d80](https://github.com/vovkasm/react-native-stylable/commit/6449d80))
* migrate to prop-types module (React.PropTypes is deprecated) ([1cd5750](https://github.com/vovkasm/react-native-stylable/commit/1cd5750))
* react warn if we try to get ref of pure component ([ffadc1e](https://github.com/vovkasm/react-native-stylable/commit/ffadc1e))


### Features

* **package:** compile & release es5 version ([0e0ba9a](https://github.com/vovkasm/react-native-stylable/commit/0e0ba9a))



# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# 0.0.5 (2016-12-26)

* Proxy setNativeProps to wrapped components so they can be used as direct Touchable childs. (cb5ba87)
* Add benchmarks for selectors (be0ab83)
* Split bench.js to runner and benchmark function. (e274907)

# 0.0.4 (2016-12-22)

* Use default for React Native .babelrc file. Using babel-plugin-istanbul breaks testing in apps, that use this module. (41ac903)
* Add test for "out-of-tree" components (b07dcee)
* Add additional tests for rules order. (aea0375)

# 0.0.3 (2016-12-21)

The first working version