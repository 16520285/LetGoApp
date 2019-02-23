import React from 'react';
import { View , PermissionsAndroid, ViewPropTypes,Dimensions } from 'react-native';
import { AccessToken, LoginManager, GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
import firebase from 'react-native-firebase';
import {Button,Icon,Text} from 'native-base'
import { NavigationEvents } from 'react-navigation';

export default class LoginScreen extends React.Component {

    componentDidMount() {
        firebase.auth().onAuthStateChanged(user => {
            
            if(!user){
                this.props.navigation.popToTop();
                return;
            }
            else {
                    if(user.phoneNumber)
                        this.props.navigation.navigate('TeamView');
                    else {
                        this.props.navigation.navigate('TeamView');
                        firebase.firestore().doc('Users/' + user.uid).get().then((value)=>{
                            // this.props.navigation.navigate('AddPhoneNumber', {User: user});
                            this.getCurrentPosition(user.uid, value.data());
                        });
                    }
            }
        })
    }

    getCurrentPosition(uid,user){
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((value)=>{
            if(value == PermissionsAndroid.RESULTS.GRANTED){
                navigator.geolocation.getCurrentPosition((position) => {
                        firebase.database().ref('CurrentLocation/').child(uid).set({
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            lastUpdate: Date.now(),
                        })
                    },
                    (error) => console.log(error),
                    { enableHighAccuracy: false, timeout: 5000, distanceFilter: 10 },
                )
            }
        })
    }

    constructor(props){
        super(props);
        this.ref = firebase.firestore().collection('Users');
    }
    
    facebookLogin = async () => {
        try {
            LoginManager.logOut(); // Log out first to avoid error "User logged in as different Facebook user".
            const result = await LoginManager.logInWithReadPermissions(['public_profile', 'email']);
        
            if (result.isCancelled) {
                return;
                //throw new Error('User cancelled request'); // Handle this however fits the flow of your app
            }
        
            console.log(`Login success with permissions: ${result.grantedPermissions.toString()}`);
        
            // get the access token
            AccessToken.getCurrentAccessToken().then(
                (data)=>{
                    const credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken)
                    const userCredential = firebase.auth().signInWithCredential(credential).then((cre)=>{
                        firebase.firestore().doc('Users/' + cre.user.uid).set({
                            displayName: cre.user.displayName,
                            email: cre.user.email,
                            photoURL: cre.user.photoURL,
                        })

                        const responseInfoCallback = (error, result) => {
                            if (error) {
                                console.log(error)
                            } else {
                                firebase.firestore().doc('Users/' + cre.user.uid).update(
                                    'photoURL', result.picture.data.url,
                                )
                            }
                        }
                        const infoRequest = new GraphRequest(
                            '/me',
                            {
                                accessToken: data.accessToken,
                                httpMethod: 'GET',
                                parameters: {
                                    fields: {
                                        string: 'picture.type(large)'
                                    }
                                }
                            },
                            responseInfoCallback
                        );
    
                        // Start the graph request.
                        new GraphRequestManager().addRequest(infoRequest).start();
                    })
                }
            );
        } catch (e) {
            console.error(e);
        }
    }

    render() {
        return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <NavigationEvents
                onDidFocus={payload => this.componentDidMount()} //If user click Back Button in Android
            />
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Button  rounded
                
                onPress={this.facebookLogin}
                    
               
            >
            <Icon name ='logo-facebook'></Icon><Text light>Login with Facebook</Text></Button>
            </View>
        </View>
        );
    }
}