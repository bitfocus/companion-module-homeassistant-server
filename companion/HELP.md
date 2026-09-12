## Home Assistant

### Configuration

- In Home Assistant, navigate to your Profile page. This should be at the bottom left of the web interface, below the Notifications tab
- In the Home Assistant Profile page, scroll to the very bottom to find the **Long-Lived Access Tokens** section.
  ![Home Assistant Profile Page](images/ha-profile-page.png?raw=true 'Home Assistant Profile Page')
- Next, click "Create Token", give your token a name, and click "OK." Your access token should appear. Copy your token, then navigate to Companion.
- In Companion, navigate to the Home Assistant Server module settings and paste your Access Token. Then, input your Home Assistant URL. _Note: This URL should include the port, which is 8123 by default (ex. `http://192.168.1.10:8123` or `http://homeassistant.local:8123`)_

### Available actions

- Set switch state
- Set input_boolean state
- Set light on/off state
- Set light brightness (percentage)
- Adjust light brightness (percentage)
- Execute script
- Press button
- Activate scene
- Input Select: First
- Input Select: Last
- Input Select: Next
- Input Select: Previous
- Input Select: Select
- Set group on/off state
- Set lock state (lock / unlock / toggle)
- Cover: Open
- Cover: Close
- Cover: Stop
- Cover: Toggle open/close
- Cover: Set position (percentage)
- Climate: Set on/off state
- Climate: Set HVAC mode
- Climate: Set target temperature
- Call Service

### Available feedbacks

- Switch state
- Input_boolean state
- Light on state
- Binary sensor state
- Input select state
- Group on state
- Lock state
- Cover open/closed state
- Climate HVAC mode
- Climate HVAC action

### Available variables

- Entity Value
- Entity Name
- Light Brightness

### Limiting variables

Home Assistant can publish thousands of entities, each with many attributes. By default a Companion variable is created for every one of them, which can slow down large installations. The settings below limit this; leave them untouched to keep every variable.

- **Disable variables entirely**: create no variables at all (actions and feedbacks still work).
- **Include / exclude entity patterns**: which entities produce variables, matched against the entity id (e.g. `light.kitchen`). Include is an allowlist (empty = all); exclude drops any match.
- **Disable entity attribute variables**: skip all per-attribute variables, which make up the bulk on most installs.
- **Include / exclude attribute patterns**: which attributes of the kept entities produce variables, matched against the attribute name (e.g. `color_mode`). No effect when attribute variables are disabled.

All patterns support the `*` (any characters) and `?` (one character) wildcards and comma-separated lists. Within each pair, something is kept when it matches the include patterns (or none are given) **and** no exclude pattern. The entity `value`, name and (for lights) `brightness` variables are always kept; the attribute patterns only affect the `…attributes.*` variables.

#### Entity pattern examples

Include / exclude entity patterns are matched against the entity id:

| Pattern | Matches |
| --- | --- |
| `light.kitchen` | Only the single entity `light.kitchen` (exact match) |
| `light.*` | All entities in the `light` domain (`light.kitchen`, `light.living_room`, …) |
| `*.kitchen` | The `kitchen` entity in any domain (`light.kitchen`, `switch.kitchen`, …) |
| `sensor.*temperature*` | Any `sensor` whose id contains `temperature` |
| `switch.desk_?` | `switch.desk_1`, `switch.desk_2`, … but not `switch.desk_10` |
| `light.*, switch.*` | All lights **and** all switches (comma-separated list) |
| `*battery*` | Any entity whose id contains `battery` (useful as an exclude pattern) |

Example: Include `sensor.*` with Exclude `*battery*` exposes every sensor except battery sensors.

#### Attribute pattern examples

Include / exclude attribute patterns are matched against the attribute name:

| Pattern | Matches |
| --- | --- |
| `color_mode` | Only the `color_mode` attribute |
| `color_mode, color_temp` | The `color_mode` and `color_temp` attributes (comma-separated list) |
| `*color*` | Any attribute whose name contains `color` (`color_mode`, `color_temp`, `hs_color`, …) |
| `supported_*` | Any attribute starting with `supported_` (useful as an exclude pattern) |
| `friendly_name` | The `friendly_name` attribute (useful as an exclude pattern; it is already available as the entity name variable) |

Example: to keep your lights but only expose their `color_mode` attribute, set *Include entity patterns* to `light.*` and *Include attribute patterns* to `color_mode`.
