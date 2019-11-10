# companion-module-home-assistant

## Getting started

Executing a `yarn` command should perform all necessary steps to develop the module, if it does not then follow the steps below.

This project is written in typescript. As companion core does not currently provide typescript definitions, we assume they get injected by the atem module.
The module can be built once with `yarn build`. This should be enough to get the module to be loadable by companion.

While developing the module, by using `yarn build:watch` the compiler will be run in watch mode to recompile the files on change.

## Changes
