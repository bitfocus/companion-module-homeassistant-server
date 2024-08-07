## Home Assistant

**Configuration**

- In Home Assistant, navigate to your Profile page. This should be at the bottom left of the web interface, below the Notifications tab
- In the Home Assistant Profile page, scroll to the very bottom to find the **Long-Lived Access Tokens** section.
  ![Home Assistant Profile Page](images/ha-profile-page.png?raw=true 'Home Assistant Profile Page')
- Next, click "Create Token", give your token a name, and click "OK." Your access token should appear. Copy your token, then navigate to Companion.
- In Companion, navigate to the Home Assistant Server module settings and paste your Access Token. Then, input your Home Assistant URL. _Note: This URL should include the port, which is 8123 by default (ex. `http://192.168.1.10:8123` or `http://homeassistant.local:8123`)_

**Available actions**

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
- Call Service

**Available feedbacks**

- Switch state
- Input_boolean state
- Light on state
- Binary sensor state
- Input select state
- Group on state

**Available variables**

- Entity Value
- Entity Name
- Light Brightness
