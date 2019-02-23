import React ,{Component} from 'react';
import {StyleSheet, Dimensions, Image, ListView, Animated, PermissionsAndroid, ViewPropTypes } from 'react-native'
import { Container, View, Text } from 'native-base';
import MapView, { Marker, ProviderPropType } from 'react-native-maps';
import firebase from 'react-native-firebase';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const CARD_HEIGHT = height / 4;
const CARD_WIDTH = CARD_HEIGHT - 50;

export default class MapScreen extends Component{

    static navigationOptions = {
        title: 'Định vị',
    }

    constructor(props){
        super(props);
        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.ListMember = this.props.navigation.getParam('ListMember', []);
        this.host = this.props.navigation.getParam('host', null);
        this.map = null;
        this.watchPositionNumber = -1;
        this.currentUser = firebase.auth().currentUser;
        this.updated = false,
        this.updatedHost = false,
        this.index = 0,
        this.animation = new Animated.Value(0),
        this.ref = [],
        this.state = {
            markers: [],
            locationResult: null,
            latitude: 10,
            longitude: 10,
            latDelta: 0.05,
            northeastLat: 359,
            southwestLat: 0,
        }
    }

    componentDidMount(){
        firebase.database().goOnline();
        //Get position of Host
        firebase.database().ref('CurrentLocation/' + this.host).on('value', (snapshot)=>{
            if(snapshot.val()){
                const {latitude, longitude, photoURL, displayName, lastUpdate} = snapshot.val();

                this.setState({
                    markers: this.PushIntoMarkerList({
                        coordinate: {
                            latitude,
                            longitude,
                        },
                        displayName,
                        lastUpdate,
                        photoURL,
                        uid: this.host
                    }),
                })

                if(!this.updatedHost){
                    this.setState({
                        latitude,
                        longitude,
                    })
                    this.updatedHost = true;
                }
            }
        })

        //Get position of member
        this.ListMember.forEach((member)=>{
            firebase.database().ref('CurrentLocation/' + member.uid).on('value', (snapshot)=>{
                if(snapshot.val()){

                    const {latitude, longitude, photoURL, displayName, lastUpdate} = snapshot.val();

                    if(!this.updated){
                        if(this.state.northeastLat > latitude) {
                            this.setState({
                                northeastLat: latitude
                            })
                        }
                        if(this.state.southwestLat < latitude)
                            this.setState({
                                southwestLat: latitude
                            });
                        this.updated=true;
                    }
                    

                    this.setState({
                        markers: this.PushIntoMarkerList({
                            coordinate: {
                                latitude,
                                longitude,
                            },
                            photoURL,
                            displayName,
                            lastUpdate,
                            uid: member.uid
                        })
                    })
                }
            })
        })

        this.getCurrentPosition(this.currentUser);

        this.animation.addListener(({ value }) => {
            let index = Math.floor(value / CARD_WIDTH + 0.3); // animate 30% away from landing on the next item
            if (index >= this.state.markers.length) {
              index = this.state.markers.length - 1;
            }
            if (index <= 0) {
              index = 0;
            }
      
            clearTimeout(this.regionTimeout);
            this.regionTimeout = setTimeout(() => {
              if (this.index !== index) {
                this.index = index;
                const { coordinate } = this.state.markers[index];
                this.map.animateToCoordinate(
                {
                    ...coordinate,
                },
                  350
                );
              }
            }, 10);
          });
    }

    getCurrentPosition(user){
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((value)=>{
            if(value == PermissionsAndroid.RESULTS.GRANTED){
                this.watchPositionNumber = navigator.geolocation.watchPosition((position) => {
                        console.log(position);
                        firebase.database().ref('CurrentLocation/').child(user.uid).update({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            lastUpdate: new Date(),
                        })
                    },
                    (error) => console.log(error),
                    { enableHighAccuracy: false, timeout: 5000, distanceFilter: 10 },
                )
            }
        })
    }

    componentWillMount(){
        // console.log("dsfsdf");
        // firebase.database().ref('CurrentLocation/' + this.host).off();
        // this.ListMember.forEach((member)=>{
        //     firebase.database().ref('CurrentLocation/' + member.uid).off();
        // })

        // navigator.geolocation.clearWatch(this.watchPositionNumber);

    }    

    componentWillUnmount() {
        // console.log("dsfsdf");
        // firebase.database().ref('CurrentLocation/' + this.host).off('value');
        // this.ListMember.forEach((member)=>{
        //     firebase.database().ref('CurrentLocation/' + member.uid).off('value');
        // })

        firebase.database().goOffline();

        navigator.geolocation.clearWatch(this.watchPositionNumber);
        
        // this.index = 0;
        // this.animation = new Animated.Value(0);
      }

    timeDifference(current, previous) {

        var msPerMinute = 60 * 1000;
        var msPerHour = msPerMinute * 60;
        var msPerDay = msPerHour * 24;
        var msPerMonth = msPerDay * 30;
        var msPerYear = msPerDay * 365;
    
        var elapsed = current - previous;
    
        if (elapsed < msPerMinute) {
             return Math.round(elapsed/1000) + ' giây trước';   
        }
    
        else if (elapsed < msPerHour) {
             return Math.round(elapsed/msPerMinute) + ' phút trước';   
        }
    
        else if (elapsed < msPerDay ) {
             return Math.round(elapsed/msPerHour ) + ' giờ trước';   
        }
    
        else if (elapsed < msPerMonth) {
            return 'gần ' + Math.round(elapsed/msPerDay) + ' ngày trước';   
        }
    
        else if (elapsed < msPerYear) {
            return 'gần ' + Math.round(elapsed/msPerMonth) + ' tháng trước';   
        }
    
        else {
            return 'gần ' + Math.round(elapsed/msPerYear ) + ' năm trước';   
        }
    }

    PushIntoMarkerList(newMarker){
        var markers = this.state.markers;
        for(var i in markers){
            if(newMarker.uid === markers[i].uid){
                markers[i] = newMarker;
                return markers;
            }
        }
        markers.push(newMarker);
        return markers;
    }

    ConvertTime(time){
        console.log(time);
    }

    render() { 

        const interpolations = this.state.markers.map((marker, index) => {
            const inputRange = [
                (index - 1) * CARD_WIDTH,
                index * CARD_WIDTH,
                ((index + 1) * CARD_WIDTH),
            ];
            const scale = this.animation.interpolate({
                inputRange,
                outputRange: [1, 2.5, 1],
                extrapolate: "clamp",
            });
            const opacity = this.animation.interpolate({
                inputRange,
                outputRange: [0.35, 1, 0.35],
                extrapolate: "clamp",
            });
            return { scale, opacity };
        });

        return (
            <Container style={{flexDirection: 'row'}}>
                <MapView
                    ref={map=>this.map = map}
                    provider={this.props.provider}
                    style={[styles.map, {flex: 2}]}
                    initialRegion={{
                        latitude: this.state.latitude,
                        longitude: this.state.longitude,
                        latitudeDelta: this.state.southwestLat ? Math.abs(this.state.southwestLat - this.state.northeastLat) : this.state.latDelta,
                        longitudeDelta: this.state.southwestLat ? Math.abs(this.state.southwestLat - this.state.northeastLat) : this.state.latDelta * ASPECT_RATIO,
                    }}
                    onPress={this.onMapPress}
                >
                {this.state.markers.map((marker, index) =>{
                    const scaleStyle = {
                    transform: [
                        {
                        scale: interpolations[index].scale,
                        },
                    ],};
                    const opacityStyle = {
                        opacity: interpolations[index].opacity,
                    }; 

                    return (
                    <Marker
                        title={marker.displayName}
                        key={marker.uid}
                        coordinate={marker.coordinate}
                    >
                        <Animated.View style={[styles.markerWrap, opacityStyle]}>
                            <Animated.View style={[styles.ring, scaleStyle]} />
                            <Image source={{uri: marker.photoURL}} style={styles.customMarker}/>
                        </Animated.View>
                    </Marker>
                )}
                )}
                </MapView>
                <Animated.ScrollView
                    horizontal
                    scrollEventThrottle={1}
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={CARD_WIDTH}
                    onScroll={Animated.event(
                        [
                            {
                                nativeEvent: {
                                    contentOffset: {
                                        x: this.animation,
                                    },
                                },
                            },
                        ],
                        { useNativeDriver: true }
                    )}
                    style={styles.scrollView}
                    contentContainerStyle={styles.endPadding}
                    >
                    {this.state.markers.map((marker, index) => {
                        return(<View style={styles.card} key={index}>
                            <Image
                                source={{uri: marker.photoURL}}
                                style={styles.cardImage}
                                resizeMode="cover"
                            />
                            <View style={styles.textContent}>
                                <Text numberOfLines={1} style={styles.cardtitle}>{marker.displayName}</Text>
                                <Text numberOfLines={1} style={styles.cardDescription}>
                                    {this.timeDifference(Date.now(), marker.lastUpdate)}
                                </Text>
                            </View>
                            </View>
                        )}
                    )}
                    </Animated.ScrollView>
            </Container>
        );
    }
}

MapScreen.propTypes = {
    provider: ProviderPropType,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    bubble: {
      backgroundColor: 'rgba(255,255,255,0.7)',
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 20,
    },
    latlng: {
      width: 200,
      alignItems: 'stretch',
    },
    button: {
      width: 80,
      paddingHorizontal: 12,
      alignItems: 'center',
      marginHorizontal: 10,
    },
    buttonContainer: {
      flexDirection: 'row',
      marginVertical: 20,
      backgroundColor: 'transparent',
    },
    customMarker: {
        width: 40, 
        height: 40, 
        borderRadius: 30, 
        borderColor: '#fff', 
        borderWidth: 3
    },
    scrollView: {
      position: "absolute",
      bottom: 30,
      left: 0,
      right: 0,
      paddingVertical: 10,
    },
    endPadding: {
      paddingRight: width - CARD_WIDTH,
    },
    card: {
      padding: 10,
      elevation: 2,
      backgroundColor: "#FFF",
      marginHorizontal: 10,
      shadowColor: "#000",
      shadowRadius: 5,
      shadowOpacity: 0.3,
      shadowOffset: { x: 2, y: -2 },
      height: CARD_HEIGHT,
      width: CARD_WIDTH,
      overflow: "hidden",
    },
    cardImage: {
      flex: 3,
      width: "100%",
      height: "100%",
      alignSelf: "center",
    },
    textContent: {
      flex: 1,
    },
    cardtitle: {
      fontSize: 12,
      marginTop: 5,
      fontWeight: "bold",
    },
    cardDescription: {
      fontSize: 10,
      color: "#444",
    },
    markerWrap: {
      alignItems: "center",
      justifyContent: "center",
    },
  });


  //Reference:
  // - https://codedaily.io/tutorials/9/Build-a-Map-with-Custom-Animated-Markers-and-Region-Focus-when-Content-is-Scrolled-in-React-Native