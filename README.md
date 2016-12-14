# react-native-stylable

Cascading styles for ReactNative.
A components for easy styling you React Native application.

:warning: The package is currently in alpha stage of development. If you find a bug or missing functionality, please feel free to report, but better fix or implement what you want and send a pull request to GitHub repository.

## Installation

```sh
npm install --save react-native-stylable
```

## Usage

```javascript
// app.js
import React from 'react'
import { StyleProvider } from 'react-native-stylable'

import AppView from './AppView'
import styleSheet from './styles'

const App = () => <StyleProvider styleSheet={styleSheet}>
  <AppView/>
</StyleProvider>

export default App
```

```javascript
// styles.js
import { Stylesheet } from 'react-native-stylable'

const s = new Stylesheet()
// Global styles, theme code, etc...
// Will overwrite defaults...
s.addRules({
  'baseText': {
    style: { fontSize: 8 }
  }
})
export default s
```

```javascript
// some component, Item.js for ex
import React, { PropTypes } from 'react'
import { Image, Text, View } from 'react-native'
import { stylable } from 'react-native-stylable'

import styleSheet from './styles'

// default styles for our component
styleSheet.addDefaultRules({
  Item: {
    style: {
      borderWidth: 1,
      borderColor: 'rgb(240,240,240)',
      margin: 4,
      flex: 1
    }
  },
  'Item Description': {
    style: {
      marginHorizontal: 12
    }
  },
  'Item PriceText': {
    mixins: ['baseText'],
    style: {
      fontWeight: 'bold'
    }
  },
  'Item DescriptionText': {
    mixins: ['baseText'],
    style: {
      marginVertical: 6
    }
  },
  'Item Image': {
    style: {
      left: 0,
      right: 0,
      height: 160
    }
  }
})

const Description = stylable('Description')(View)
const DescriptionText = stylable('DescriptionText')(Text)
const Image = stylable('Image')(Image)
const PriceText = stylable('PriceText')(Text)

class Item extends React.Component {
  static propTypes = {
    modelItem: PropTypes.object.isRequired
  }
  render () {
    const { modelItem, ...other } = this.props
    const price = modelItem.price + modelItem.currency
    const uri = modelItem.imageUri
    return <View {...other}>
      <Image source={{uri}} />
      <Description>
        <DescriptionText>{modelItem.name}</DescriptionText>
        <PriceText>{price}</PriceText>
      </Description>
    </View>
  }
}

export default stylable('Item')(Item)
```

## Author

[Vladimir Timofeev](https://github.com/vovkasm)

## License

Source code is licensed under the MIT License.
