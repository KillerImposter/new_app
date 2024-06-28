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
      console.log(`${contact.displayName}: `);
      contact.phoneNumbers.forEach((numberDetails) => { 
        numberDetails.number = numberDetails.number.replaceAll("-","");
        numberDetails.number = numberDetails.number.replaceAll(" ","");
        numberDetails.number = numberDetails.number.replaceAll("(","");
        numberDetails.number = numberDetails.number.replaceAll(")","");
        console.log(numberDetails.number);
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
      console.log('READ_CALL_LOG: ' + permissionStatus['android.permission.READ_CALL_LOG']);
      console.log('READ_CONTACTS: ' + permissionStatus['android.permission.READ_CONTACTS']);
      console.log('READ_PHONE_STATE: ' + permissionStatus['android.permission.READ_PHONE_STATE']);
    }
    catch (err) {
      console.log(err);
    }
  }

  async function readContacts() {
    PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CONTACTS).then(async () => {
      const contactList = await Contacts.getAllWithoutPhotos();
      setContacts(contactList);
    });
  }

  function startDetection() {
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
              if(numberDetails.number === number)
              {
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
      true, // if you want to read the phone number of the incoming call [ANDROID], otherwise false
      () => { }, // callback if your permission got denied [ANDROID] [only if you want to read incoming number] default: console.error
      {
        title: 'Phone State Permission',
        message:
          'This app needs access to your phone state in order to react and/or to adapt to incoming calls.',
      }, // a custom permission request message to explain to your user, why you need the permission [recommended] - this is the default one
    );
  };
  function stopDetection() {
    this.callDetector && this.callDetector.dispose();
    setFeatureOn(false);
    setIncoming(false);
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
        onPress={featureOn ? stopDetection : startDetection}>
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