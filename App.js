import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, useColorScheme, View, Text, Button, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Card, ListItem } from 'react-native-elements';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as Cellular from 'expo-cellular';
import * as Network from 'expo-network';
import * as Updates from 'expo-updates';

export default function App() {
  const [emulatorExpanded, setEmulatorExpanded] = useState(false);
  const [rootExpanded, setRootExpanded] = useState(false);
  const [devModeExpanded, setDevModeExpanded] = useState(false);
  const [passCount, setPassCount] = useState(0);

  const [isEmulator, setIsEmulator] = useState(null);
  const [isRooted, setIsRooted] = useState(null);
  const [isDevMode, setIsDevMode] = useState(null);
  const [emulatorDetails, setEmulatorDetails] = useState([]);
  const [rootDetails, setRootDetails] = useState([]);

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    const checkDeviceStatus = async () => {
      const rootReasons = [];
      const emulatorReasons = [];

      // 조건 1: 루팅/탈옥 확인
      try {
        let rooted = await Device.isRootedExperimentalAsync();

        if (rooted == null) {
          rooted = false;
        }

        if (rooted) {
          rootReasons.push('Root/Jailbreak status detected via Device API.');
        }

        const rootApps = [
          'com.topjohnwu.magisk',
          'eu.chainfire.supersu',
          'com.koushikdutta.superuser',
          'com.noshufou.android.su',
          'com.thirdparty.superuser',
          'com.yellowes.su'
        ];

        const installedRootApps = await Promise.all(rootApps.map(async (app) => {
          try {
            const isInstalled = await Application.getInstallReferrerAsync({ packageName: app });
            return isInstalled !== null;
          } catch (error) {
            return false;
          }
        }));

        if (installedRootApps.includes(true)) {
          rootReasons.push('Presence of known root apps.');
        }

        if (rootReasons.length > 0) {
          setIsRooted(true);
          setRootDetails(rootReasons);
        } else {
          setIsRooted(false);
        }
      } catch (error) {
        setIsRooted(true);
        rootReasons.push('Error occurred while checking root status.');
        setRootDetails(rootReasons);
      }

      // 조건 2: 에뮬레이터 여부 확인
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

        const emulatorApps = [
          'com.google.android.launcher.layouts.genymotion',
          'com.bluestacks',
          'com.bignox.app',
          'com.vphone.launcher',
          'com.microvirt.tools',
          'com.microvirt.download',
          'com.cyanogenmod.filemanager',
          'com.mumu.store'
        ];

        const installedEmulatorApps = await Promise.all(emulatorApps.map(async (app) => {
          try {
            const isInstalled = await Application.getInstallReferrerAsync({ packageName: app });
            return isInstalled !== null;
          } catch (error) {
            return false;
          }
        }));

        if (installedEmulatorApps.includes(true)) {
          emulatorReasons.push('Presence of known emulator apps.');
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
          setIsEmulator(true);
          setEmulatorDetails(emulatorReasons);
        } else {
          setIsEmulator(false);
        }
      } catch (error) {
        setIsEmulator(true);
        emulatorReasons.push('Error occurred while checking emulator status.');
        setEmulatorDetails(emulatorReasons);
      }

      // 조건 3: 개발자 모드 여부 확인
      const devMode = __DEV__;
      setIsDevMode(devMode);
    };

    checkDeviceStatus();
  }, []);

  useEffect(() => {
    const count = [isEmulator, isRooted, isDevMode].filter(status => status === false).length;
    setPassCount(count);
  }, [isEmulator, isRooted, isDevMode]);

  const handleReload = () => {
    Updates.reloadAsync();
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <Text style={[styles.headerText, isDarkMode && styles.headerTextDark]}>
              Device Information
            </Text>
            <Text style={[styles.subHeaderText, isDarkMode && styles.headerTextDark]}>
              {isEmulator === null || isRooted === null || isDevMode === null ? " Checking..." : `${passCount}/3 items passed`}
            </Text>
          </View>

          <Card containerStyle={[styles.card, isDarkMode && styles.cardDark]}>
            <ListItem.Accordion
              content={
                <ListItem.Content>
                  <ListItem.Title>Is Emulator: {isEmulator === null ? " Checking..." : isEmulator ? "Yes" : "No"}</ListItem.Title>
                </ListItem.Content>
              }
              isExpanded={emulatorExpanded}
              onPress={() => setEmulatorExpanded(!emulatorExpanded)}
              containerStyle={styles.accordion}
            >
              {emulatorExpanded && (
                <>
                  {isEmulator === null ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#0000ff" />
                      <Text> Checking...</Text>
                    </View>
                  ) : (
                    <>
                      <ListItem>
                        <ListItem.Content>
                          <ListItem.Subtitle>
                            This device is {isEmulator ? "" : "not "}an emulator.
                          </ListItem.Subtitle>
                        </ListItem.Content>
                      </ListItem>
                      {emulatorDetails.map((detail, index) => (
                        <ListItem key={index} containerStyle={styles.detailItem}>
                          <ListItem.Content>
                            <ListItem.Subtitle style={styles.detailText}>
                              {detail}
                            </ListItem.Subtitle>
                          </ListItem.Content>
                        </ListItem>
                      ))}
                    </>
                  )}
                </>
              )}
            </ListItem.Accordion>
          </Card>

          <Card containerStyle={[styles.card, isDarkMode && styles.cardDark]}>
            <ListItem.Accordion
              content={
                <ListItem.Content>
                  <ListItem.Title>Is {Device.osName === 'iOS' ? 'Jailbreak' : 'Rooted'}: {isRooted === null ? " Checking..." : isRooted ? "Yes" : "No"}</ListItem.Title>
                </ListItem.Content>
              }
              isExpanded={rootExpanded}
              onPress={() => setRootExpanded(!rootExpanded)}
              containerStyle={styles.accordion}
            >
              {rootExpanded && (
                <>
                  {isRooted === null ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#0000ff" />
                      <Text> Checking...</Text>
                    </View>
                  ) : (
                    <>
                      <ListItem>
                        <ListItem.Content>
                          <ListItem.Subtitle>
                            {Device.osName === 'iOS' ? 'This device is not jailbroken.' : 'This device is not rooted.'}
                          </ListItem.Subtitle>
                        </ListItem.Content>
                      </ListItem>
                      {rootDetails.map((detail, index) => (
                        <ListItem key={index} containerStyle={styles.detailItem}>
                          <ListItem.Content>
                            <ListItem.Subtitle style={styles.detailText}>
                              {detail}
                            </ListItem.Subtitle>
                          </ListItem.Content>
                        </ListItem>
                      ))}
                    </>
                  )}
                </>
              )}
            </ListItem.Accordion>
          </Card>

          <Card containerStyle={[styles.card, isDarkMode && styles.cardDark]}>
            <ListItem.Accordion
              content={
                <ListItem.Content>
                  <ListItem.Title>Is Developer Mode: {isDevMode === null ? " Checking..." : isDevMode ? "Yes" : "No"}</ListItem.Title>
                </ListItem.Content>
              }
              isExpanded={devModeExpanded}
              onPress={() => setDevModeExpanded(!devModeExpanded)}
              containerStyle={styles.accordion}
            >
              {devModeExpanded && (
                <>
                  {isDevMode === null ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#0000ff" />
                      <Text> Checking...</Text>
                    </View>
                  ) : (
                    <ListItem>
                      <ListItem.Content>
                        <ListItem.Subtitle>
                          Developer mode is {isDevMode ? "enabled" : "disabled"} on this device.
                        </ListItem.Subtitle>
                      </ListItem.Content>
                    </ListItem>
                  )}
                </>
              )}
            </ListItem.Accordion>
          </Card>

          <View style={[styles.buttonContainer, styles.buttonContainerPadding]}>
            <Button title="Recheck" onPress={handleReload} />
          </View>

        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerTextDark: {
    color: '#fff',
  },
  subHeaderText: {
    fontSize: 18,
    color: '#555',
  },
  card: {
    width: '100%',
    marginVertical: 10,
    padding: 0,
    borderRadius: 10,
    borderWidth: 0,
    backgroundColor: '#fff',
    paddingBottom: 20, // Add paddingBottom here
  },
  cardDark: {
    backgroundColor: '#333',
  },
  accordion: {
    backgroundColor: 'transparent',
  },
  detailItem: {
    backgroundColor: 'transparent',
    paddingLeft: 20,
    paddingVertical: 2,
  },
  detailText: {
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20, // Add paddingBottom here
  },
  buttonContainerPadding: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
});
