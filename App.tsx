/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import {
  Alert,
  Linking,
  PermissionsAndroid,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import Contacts, { Contact } from 'react-native-contacts';
import RNCallKeep from 'react-native-callkeep';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({ children, title }: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    askPermission()
      .then(() => {
        readContacts().then(() => {
          setupCallKeep();
        })
      });
  }, []);

  async function readContacts() {
    PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CONTACTS).then(async () => {
      const contactList = await Contacts.getAllWithoutPhotos();
      setContacts(contactList);
    });
  }

  async function askPermission() {
    try {
      const permissionStatus = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
        PermissionsAndroid.PERMISSIONS.PROCESS_OUTGOING_CALLS,
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE
      ]);
      console.log('READ_CALL_LOG: ' + permissionStatus['android.permission.READ_CALL_LOG']);
      console.log('READ_CONTACTS: ' + permissionStatus['android.permission.READ_CONTACTS']);
      console.log('READ_PHONE_STATE: ' + permissionStatus['android.permission.READ_PHONE_STATE']);
    }
    catch (err) {
      console.log(err);
    }
  }

  async function setupCallKeep() {
    try {
      RNCallKeep.setup({
        ios: {
          appName: 'CallKeepDemo',
        },
        android: {
          alertTitle: 'Permissions required',
          alertDescription: 'This application needs to access your phone accounts',
          cancelButton: 'Cancel',
          additionalPermissions: [],
          okButton: 'ok',
        },
      })
        .then(async() => {
          RNCallKeep.setAvailable(true);  // You can now start receiving calls
          console.log('RNCallkeep setup successfully');
          // const permissionStatus = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE)
          // if(permissionStatus)
          //   console.log('READ_PHONE_STATE: granted');
          // else
          //   console.log('READ_PHONE_STATE: not granted');
        })
        .catch((err) => console.log(`RNCallKeep setup error: ${err}`));
    }
    catch (err) {
      console.log('initializeCallKeep error:', err)
    }
  }

  // Code to log the contacts
  // useEffect(() => {
  //   contacts.forEach(contact => {
  //     console.log(`${contact.displayName}: `);
  //     contact.phoneNumbers.forEach((Details) => { console.log(Details.number) });
  //   });
  // }, [contacts]);

  useEffect(() => {
    RNCallKeep.addEventListener('didReceiveStartCallAction', () => console.log('Incoming call'));
    RNCallKeep.addEventListener('answerCall', () => console.log('Answered call'));
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <Section title='Hi'></Section>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;