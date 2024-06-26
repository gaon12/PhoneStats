# PhoneStats
Make sure your smartphone is an emulator, rooted, and that developer mode is enabled.

Check in multiple ways to be more accurate.

# elements to check
## Emulator status
Checks for emulator status. If any of the following conditions are true, it is considered an emulator.

* DeviceType.DESKTOP is True
* The architecture is `x86` or `i686`.
* The device model name starts with `sdk`.
* The serial address starts with `EMULATOR`.
* If the IP address is `10.0.2.15`.
* (iOS Only) If the Carrier Name is `Appetize.io`.

## Verify root/jailbreak
Checks for root/jailbreak status. If the following conditions are met, it is considered rooted/jailbroken.

* Checked with the Device API

## Check developer mode (Android only)
Checks whether developer mode is enabled. Developer mode is considered enabled if the following conditions are met.

* Checked with the Device API

# Test on your PC
1. Clone this repo.
2. Run `npm install` to install packages.
3. Run `npm start` to start expo.