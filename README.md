# Forge Runtime Examples

Examples of integrating various [Runes][rune] into an app using the
[Forge][forge] SDK.

There are two main SDKs for interacting with Forge,

- [`@hotg-ai/forge`](https://www.npmjs.com/package/@hotg-ai/forge) - for use in
  a ReactJS application (either browser or React Native)
- [`runevm_fl`](https://pub.dev/packages/runevm_fl) - a Flutter plugin for use
  in Mobile applications and PWAs

This repository also contains examples which target various ML models,

- *RNG* is the Rune equivalent of *"Hello, World"*. Instead of running a model,
  it returns a value from the Rune's internal RNG
- *CartoonGAN* takes an image and returns cartoon-like version
- *MobileNET* and *Inception* are image classification models that take an image
  and return a list the items it thinks the image contains
- *Microspeech* is a small audio recognition model that has been trained to
  recognise words like "left", "right", "up", and "down"
- *MobileBert* is a Natural Language Processing model. It is given a question
  and a piece of text and tries to answer the question using the provided text

The models in this repository use either the TensorFlow Lite or TensorFlow JS
formats.

[rune]: https://github.com/hotg-ai/rune
[forge]: https://dev-studio.hotg.ai/
