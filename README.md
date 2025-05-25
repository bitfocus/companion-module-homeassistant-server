# companion-module-home-assistant

## Getting started

Execute `yarn` command to install the dependencies.

The module can be built once with `yarn build`. This should be enough to get the module to be loadable by companion.

While developing the module, by using `yarn dev` the compiler will be run in watch mode to recompile the files on change.

## Changes

### v1.2.0

- Variables for entity attributes
- Require Companion 3.5+

### v1.1.0

- Performance improvements

### v1.0.2

- Fix build

### v1.0.1

- Various code improvements
- Correctly send entity_id with CallService action

### v1.0.0

- Improve connection reliability
- Update for Companion 3

### v0.8.1

- 'Call any service' lists services reported by home-assistant

### v0.8.0

- Support group, input_select entities
- All actions support multiple entities
- Call any service with custom payload

### v0.7.0

- Support scene and button entities
- Add actions to change light brightness
- More variables for entities

### v0.6.1

- Update for improved module api features

### v0.6.0

- Update for improved instance_skel.checkFeedbacks signature

### v0.5.2

- Migration script not running

### v0.5.1

- Missing boolean feedback migration script

### v0.5.0

- feedbacks updated to new format. allows more customisation of style

### v0.4.0

- Support input_boolean entities

### v0.3.1

- Use variables for preset labels

### v0.3.0

- Add variables for entity names

### v0.2.0

- Add binary_sensor feedback
- Add executing scripts
