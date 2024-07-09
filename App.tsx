import React, { useEffect, useState } from 'react';
import {
  PermissionsAndroid,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import CallDetectorManager from 'react-native-call-detection';
import Contacts, { Contact } from 'react-native-contacts';
import BackgroundService from 'react-native-background-actions';

const App = () => {
  const [featureOn, setFeatureOn] = useState(false);
  const [incoming, setIncoming] = useState(false);
  const [belongsToContacts, setBelongsToContacts] = useState(false);
  const [number, setNumber] = useState(null);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const setupPermissions = async () => {
      await askPermission();
      await readContacts();
    };
    setupPermissions();
  }, []);

  useEffect(() => {
    contacts.forEach(contact => {
      // console.log(`${contact.displayName}: `);
      contact.phoneNumbers.forEach((numberDetails) => {
        numberDetails.number = numberDetails.number.replace(/[- )(]/g, '');
        // console.log(numberDetails.number);
      });
    });
  }, [contacts]);

  async function askPermission() {
    try {
      const permissionStatus = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
        PermissionsAndroid.PERMISSIONS.PROCESS_OUTGOING_CALLS,
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE
      ]);
      console.log('Permissions: ', permissionStatus);
    } catch (err) {
      console.log(err);
    }
  }

  async function readContacts() {
    const hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CONTACTS);
    if (hasPermission) {
      const contactList = await Contacts.getAllWithoutPhotos();
      setContacts(contactList);
    }
  }

  async function startBackgeoundService (taskDataArguments)
  {
    await new Promise((resolve) => {
      startDetection();
    });
  };

  async function startDetection() {
    setFeatureOn(true);
    this.callDetector = new CallDetectorManager(
      (event, number) => {
        console.log(event, number);
        if (event === 'Disconnected') {
          setIncoming(false);
          setBelongsToContacts(false);
          setNumber(null);
        } else if (event === 'Incoming') {
          setIncoming(true);
          setNumber(number);
          contacts.forEach(contact => {
            contact.phoneNumbers.forEach((numberDetails) => {
              if (numberDetails.number === number) {
                console.log(numberDetails.number, `belongs to contacts`);
                setBelongsToContacts(true);
              }
            });
          });
        } else if (event === 'Offhook') {
          setIncoming(true);
          setNumber(number);
        } else if (event === 'Missed') {
          setIncoming(false);
          setBelongsToContacts(false);
          setNumber(null);
        }
      },
      true,
      () => { },
      {
        title: 'Phone State Permission',
        message: 'This app needs access to your phone state in order to react and/or to adapt to incoming calls.',
      },
    );
  };

  function stopDetection() {
    this.callDetector && this.callDetector.dispose();
    setFeatureOn(false);
    setIncoming(false);
  };

  async function startService() {
    const options = {
      taskName: 'My warmcall app',
      taskTitle: 'Warmcall app',
      taskDesc: 'App is running in background',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      color: '#ff00ff',
      parameters: {
        delay: 5000,
      },
    };

    await BackgroundService.start(startBackgeoundService, options);
    await BackgroundService.updateNotification({ taskDesc: 'New Example description' });
  };

  async function stopService() {
    await BackgroundService.stop();
    stopDetection();
  };

  return (
    <View style={styles.body}>
      <Text style={{ color: 'black', fontSize: 26, fontWeight: '700' }}>
        Call Detection
      </Text>
      <Text style={[styles.text, { color: 'black' }]}>
        Should the detection be on?
      </Text>
      <TouchableHighlight
        style={{ borderRadius: 75 }}
        onPress={featureOn ? stopService : startService}>
        <View
          style={{
            width: 200,
            height: 200,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: featureOn ? 'green' : 'red',
            borderRadius: 75,
          }}>
          <Text style={styles.text}>{featureOn ? `Warmcall ON` : `Warmcall OFF`} </Text>
        </View>
      </TouchableHighlight>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  body: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  text: {
    padding: 20,
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  button: {},
});
