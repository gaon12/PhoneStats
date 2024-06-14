import * as Device from 'expo-device';
import * as Cellular from 'expo-cellular';
import * as Network from 'expo-network';

export const checkDeviceStatus = async () => {
  const rootReasons = [];
  const emulatorReasons = [];

  // 조건 1: 루팅/탈옥 확인
  let isRooted = false;
  try {
    let rooted = await Device.isRootedExperimentalAsync();

    if (rooted == null) {
      rooted = false;
    }

    if (rooted) {
      rootReasons.push('Root/Jailbreak status detected via Device API.');
    }

    if (rootReasons.length > 0) {
      isRooted = true;
    }
  } catch (error) {
    rootReasons.push('Error occurred while checking root status.');
    isRooted = true;
  }

  // 조건 2: 에뮬레이터 여부 확인
  let isEmulator = false;
  try {
    const architecture = Device.architecture || '';
    const serial = Device.serial || '';

    const ipAddress = await Network.getIpAddressAsync();
    const isAndroidEmulator = Device.deviceType === Device.DeviceType.DESKTOP || architecture.includes('x86') || architecture.includes('i686') || Device.modelName.startsWith('sdk') || serial.startsWith('EMULATOR') || ipAddress === '10.0.2.15';

    if (Device.deviceType === Device.DeviceType.DESKTOP) {
      emulatorReasons.push('Device type is DESKTOP.');
    }
    if (architecture.includes('x86') || architecture.includes('i686')) {
      emulatorReasons.push(`Architecture is ${architecture}.`);
    }
    if (Device.modelName.startsWith('sdk')) {
      emulatorReasons.push('Model name starts with sdk.');
    }
    if (serial.startsWith('EMULATOR')) {
      emulatorReasons.push('Serial starts with EMULATOR.');
    }
    if (ipAddress === '10.0.2.15') {
      emulatorReasons.push('IP address is 10.0.2.15.');
    }

    let isIOSEmulator = false;
    if (Device.osName === 'iOS') {
      const carrierName = await Cellular.getCarrierNameAsync();
      isIOSEmulator = carrierName && carrierName.includes('Appetize.io');
      if (isIOSEmulator) {
        emulatorReasons.push('Carrier name includes Appetize.io.');
      }
    }

    if (isAndroidEmulator || isIOSEmulator) {
      isEmulator = true;
    }
  } catch (error) {
    emulatorReasons.push('Error occurred while checking emulator status.');
    isEmulator = true;
  }

  return {
    isRooted,
    rootDetails: rootReasons,
    isEmulator,
    emulatorDetails: emulatorReasons,
    isDevMode: __DEV__
  };
};
