import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, useColorScheme, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Card, ListItem } from 'react-native-elements';
import * as Device from 'expo-device';
import { checkDeviceStatus } from './deviceChecks';

const ListItemTitle = ({ children, style }) => {
  return <Text style={style}>{children}</Text>;
};

const ListItemSubtitle = ({ children, style }) => {
  return <Text style={style}>{children}</Text>;
};

export default function App() {
  const [emulatorExpanded, setEmulatorExpanded] = useState(false);
  const [rootExpanded, setRootExpanded] = useState(false);
  const [devModeExpanded, setDevModeExpanded] = useState(false);
  const [passCount, setPassCount] = useState(0);
  const [totalChecks, setTotalChecks] = useState(3);
  const [loading, setLoading] = useState(true);

  const [isEmulator, setIsEmulator] = useState(null);
  const [isRooted, setIsRooted] = useState(null);
  const [isDevMode, setIsDevMode] = useState(null);
  const [emulatorDetails, setEmulatorDetails] = useState([]);
  const [rootDetails, setRootDetails] = useState([]);

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const loadDeviceStatus = async () => {
    setLoading(true);
    const { isRooted, rootDetails, isEmulator, emulatorDetails, isDevMode } = await checkDeviceStatus();
    setIsRooted(isRooted);
    setRootDetails(rootDetails);
    setIsEmulator(isEmulator);
    setEmulatorDetails(emulatorDetails);
    setIsDevMode(isDevMode);

    const checks = Device.osName === 'iOS' ? 2 : 3;
    setTotalChecks(checks);

    const count = [isEmulator, isRooted, Device.osName !== 'iOS' ? isDevMode : null].filter(status => status === false).length;
    setPassCount(count);
    setLoading(false);
  };

  useEffect(() => {
    loadDeviceStatus();
  }, []);

  const handleReload = () => {
    loadDeviceStatus();
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <Text style={[styles.headerText, isDarkMode && styles.headerTextDark]}>
              Device Information
            </Text>
            <Text style={[styles.subHeaderText, isDarkMode && styles.subHeaderTextDark]}>
              {loading ? " Checking..." : `${passCount}/${totalChecks} items passed`}
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007bff" />
            </View>
          ) : (
            <>
              <Card containerStyle={[styles.card, isDarkMode && styles.cardDark]}>
                <ListItem.Accordion
                  content={
                    <ListItem.Content>
                      <ListItemTitle style={isDarkMode ? styles.titleTextDark : styles.titleText}>
                        Is Emulator: {isEmulator === null ? " Checking..." : isEmulator ? "Yes" : "No"}
                      </ListItemTitle>
                    </ListItem.Content>
                  }
                  isExpanded={emulatorExpanded}
                  onPress={() => setEmulatorExpanded(!emulatorExpanded)}
                  containerStyle={[styles.accordion, isDarkMode && styles.accordionDark]}
                >
                  {emulatorExpanded && (
                    <>
                      <ListItem>
                        <ListItem.Content>
                          <ListItemSubtitle style={isDarkMode ? styles.detailTextDark : styles.detailText}>
                            This device is {isEmulator ? "" : "not "}an emulator.
                          </ListItemSubtitle>
                        </ListItem.Content>
                      </ListItem>
                      {emulatorDetails.map((detail, index) => (
                        <ListItem key={index} containerStyle={styles.detailItem}>
                          <ListItem.Content>
                            <ListItemSubtitle style={isDarkMode ? styles.detailTextDark : styles.detailText}>
                              {detail}
                            </ListItemSubtitle>
                          </ListItem.Content>
                        </ListItem>
                      ))}
                    </>
                  )}
                </ListItem.Accordion>
              </Card>

              <Card containerStyle={[styles.card, isDarkMode && styles.cardDark]}>
                <ListItem.Accordion
                  content={
                    <ListItem.Content>
                      <ListItemTitle style={isDarkMode ? styles.titleTextDark : styles.titleText}>
                        Is {Device.osName === 'iOS' ? 'Jailbreak' : 'Rooted'}: {isRooted === null ? " Checking..." : isRooted ? "Yes" : "No"}
                      </ListItemTitle>
                    </ListItem.Content>
                  }
                  isExpanded={rootExpanded}
                  onPress={() => setRootExpanded(!rootExpanded)}
                  containerStyle={[styles.accordion, isDarkMode && styles.accordionDark]}
                >
                  {rootExpanded && (
                    <>
                      <ListItem>
                        <ListItem.Content>
                          <ListItemSubtitle style={isDarkMode ? styles.detailTextDark : styles.detailText}>
                            {Device.osName === 'iOS' ? 'This device is not jailbroken.' : 'This device is not rooted.'}
                          </ListItemSubtitle>
                        </ListItem.Content>
                      </ListItem>
                      {rootDetails.map((detail, index) => (
                        <ListItem key={index} containerStyle={styles.detailItem}>
                          <ListItem.Content>
                            <ListItemSubtitle style={isDarkMode ? styles.detailTextDark : styles.detailText}>
                              {detail}
                            </ListItemSubtitle>
                          </ListItem.Content>
                        </ListItem>
                      ))}
                    </>
                  )}
                </ListItem.Accordion>
              </Card>

              {Device.osName !== 'iOS' && (
                <Card containerStyle={[styles.card, isDarkMode && styles.cardDark]}>
                  <ListItem.Accordion
                    content={
                      <ListItem.Content>
                        <ListItemTitle style={isDarkMode ? styles.titleTextDark : styles.titleText}>
                          Is Developer Mode: {isDevMode === null ? " Checking..." : isDevMode ? "Yes" : "No"}
                        </ListItemTitle>
                      </ListItem.Content>
                    }
                    isExpanded={devModeExpanded}
                    onPress={() => setDevModeExpanded(!devModeExpanded)}
                    containerStyle={[styles.accordion, isDarkMode && styles.accordionDark]}
                  >
                    {devModeExpanded && (
                      <>
                        <ListItem>
                          <ListItem.Content>
                            <ListItemSubtitle style={isDarkMode ? styles.detailTextDark : styles.detailText}>
                              Developer mode is {isDevMode ? "enabled" : "disabled"} on this device.
                            </ListItemSubtitle>
                          </ListItem.Content>
                        </ListItem>
                      </>
                    )}
                  </ListItem.Accordion>
                </Card>
              )}
            </>
          )}

          <View style={[styles.buttonContainer, styles.buttonContainerPadding]}>
            <TouchableOpacity style={styles.button} onPress={handleReload}>
              <Text style={styles.buttonText}>Recheck</Text>
            </TouchableOpacity>
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
  subHeaderTextDark: {
    color: '#aaa',
  },
  card: {
    width: '100%',
    marginVertical: 10,
    padding: 0,
    borderRadius: 10,
    borderWidth: 0,
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  cardDark: {
    backgroundColor: '#333',
  },
  accordion: {
    backgroundColor: 'transparent',
  },
  accordionDark: {
    backgroundColor: '#444',
  },
  detailItem: {
    backgroundColor: 'transparent',
    paddingLeft: 20,
    paddingVertical: 2,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
  },
  detailTextDark: {
    color: '#ccc',
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  buttonContainerPadding: {
    paddingBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  titleText: {
    color: '#333',
  },
  titleTextDark: {
    color: '#ccc',
  },
});
