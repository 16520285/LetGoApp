import React from 'react';
import { View, Text, TextInput, Button, Image, ViewPropTypes } from 'react-native';
import firebase from 'react-native-firebase';
import { AccessToken, LoginManager, GraphRequest, GraphRequestManager } from 'react-native-fbsdk';

const successImageUri = 'https://cdn.pixabay.com/photo/2015/06/09/16/12/icon-803718_1280.png';

export default class AddPhoneNumberScreen extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            user: this.props.navigation.getParam('User', null),
            message: '',
            codeInput: '',
            phoneNumber: '+84',
            confirmResult: null,
            verificationId: null,
        };
    }

    render() {
        const { user, confirmResult, verificationId } = this.state;
        return (
          <View style={{ flex: 1 }}>
    
            {!user.phoneNumber && (!confirmResult && !verificationId) && this.renderPhoneNumberInput()}
    
            {this.renderMessage()}
    
            {!user.phoneNumber && (confirmResult || verificationId) && this.renderVerificationCodeInput()}
    
            {user.phoneNumber && (
              <View
                style={{
                  padding: 15,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#77dd77',
                  flex: 1,
                }}
              >
                <Image source={{ uri: successImageUri }} style={{ width: 100, height: 100, marginBottom: 25 }} />
                <Text style={{ fontSize: 25 }}>Signed In!</Text>
                <Text>{JSON.stringify(user)}</Text>
                <Button title="Sign Out" color="red" onPress={this.signOut} />
              </View>
            )}
          </View>
        );
      }

    signIn = () => {
        const { phoneNumber } = this.state;
        this.setState({ message: 'Sending code ...' });
    
        // firebase.auth().signInWithPhoneNumber(phoneNumber)
        //   .then(confirmResult => this.setState({ confirmResult, message: 'Code has been sent!' }))
        //   .catch(error => this.setState({ message: `Sign In With Phone Number Error: ${error.message}` }));
        firebase.auth()
        .verifyPhoneNumber(phoneNumber)
        .on('state_changed', (phoneAuthSnapshot) => {
          switch (phoneAuthSnapshot.state) {
            case firebase.auth.PhoneAuthState.CODE_SENT:
              const { verificationId } = phoneAuthSnapshot;
              this.setState({verificationId, message: 'Code has been sent!' })
              break;
            case firebase.auth.PhoneAuthState.ERROR:
              console.log('verification error');
              console.log(phoneAuthSnapshot.error);
              break;
            case firebase.auth.PhoneAuthState.AUTO_VERIFY_TIMEOUT: // or 'timeout'
              console.log('auto verify on android timed out');
              break;
            case firebase.auth.PhoneAuthState.AUTO_VERIFIED: // or 'verified'
              console.log('auto verified on android');
              console.log(phoneAuthSnapshot);
              // Example usage if handling here and not in optionalCompleteCb:
              const { code } = phoneAuthSnapshot;
              this.updatePhoneNumber(verificationId, code);
              break;
          }
        }, (error) => {
          console.log(error);
          console.log(error.verificationId);
        }, (phoneAuthSnapshot) => {
          console.log(phoneAuthSnapshot);
        });
    };

    confirmCode = () => {
        const { codeInput, confirmResult, verificationId } = this.state;
    
        if (confirmResult && codeInput.length) {
          confirmResult.confirm(codeInput)
            .then((user) => {
              this.setState({ message: 'Code Confirmed!' });
              console.log(user);
            })
            .catch(error => this.setState({ message: `Code Confirm Error: ${error.message}` }));
        }
        if(verificationId && codeInput.length){
          this.updatePhoneNumber(verificationId, codeInput);
        }
    };

    updatePhoneNumber = (verificationId, codeInput)=>{
      const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, codeInput);
      this.state.user.updatePhoneNumber(credential)
      .then(() => {
        this.setState({ message: 'Code Confirmed!' });
        this.props.navigation.navigate('Home');
      })
      .catch(error => this.setState({ message: `Code Confirm Error: ${error.message}` }));
    };

    signOut = ()=>{
      firebase.auth().signOut();
    }

    renderPhoneNumberInput() {
        const { phoneNumber } = this.state;
     
         return (
           <View style={{ padding: 25 }}>
             <Text>Enter phone number:</Text>
             <TextInput
               autoFocus
               style={{ height: 40, marginTop: 15, marginBottom: 15 }}
               onChangeText={value => this.setState({ phoneNumber: value })}
               placeholder={'Phone number ... '}
               value={phoneNumber}
             />
             <Button title="Apply" color="green" onPress={this.signIn} />
             <Button title="Sign out" color="red" onPress={this.signOut} />
           </View>
         );
    }

    renderMessage() {
        const { message } = this.state;
    
        if (!message.length) return null;
    
        return (
          <Text style={{ padding: 5, backgroundColor: '#000', color: '#fff' }}>{message}</Text>
        );
    }

    renderVerificationCodeInput() {
        const { codeInput } = this.state;
    
        return (
          <View style={{ marginTop: 25, padding: 25 }}>
            <Text>Enter verification code below:</Text>
            <TextInput
              autoFocus
              style={{ height: 40, marginTop: 15, marginBottom: 15 }}
              onChangeText={value => this.setState({ codeInput: value })}
              placeholder={'Code ... '}
              value={codeInput}
            />
            <Button title="Confirm Code" color="#841584" onPress={this.confirmCode} />
          </View>
        );
    }
}