import React from 'react';
import { View, Text, ViewPropTypes } from 'react-native';
import firebase from 'react-native-firebase';

export default class LoadingScreen extends React.Component {
    componentDidMount() {
        firebase.auth().onAuthStateChanged(user => {
            if(!user)
                this.props.navigation.navigate('Login');
            else {
                if(user.phoneNumber)
                    this.props.navigation.navigate('TeamView');
                else 
                    // this.props.navigation.navigate('AddPhoneNumber', {User: user});
                    this.props.navigation.navigate('TeamView');
            }  
            
        })
    }

    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Loading Screen</Text>
            </View>
        );
    }
}