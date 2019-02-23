'use strict';
import React from 'react';
import {Dimensions, View} from 'react-native'
import {Container, Header, Content, Card, CardItem, Thumbnail, Text, Button, Icon, Left, Body, Right, Title} from 'native-base'
import firebase from 'react-native-firebase';


export default class ProfileScreen extends React.Component {
 
  static navigationOptions = {
      tabBarIcon: ()=>{return <Icon name="md-contact" style={{color: '#fff'}}/>},
  }

    constructor(props){
        super(props);
        this.ref = firebase.firestore().collection('Users');
        this.refTeam = firebase.firestore().collection('Team');
        this.uid = this.props.navigation.getParam('uid', null);
        this.state = {
            currentUser: null,
            listUsers: null,
            user: null,
            isHost: false,
            lastUpdate: null,
            holded: 0,
            attended: 0,
        };
    }

    componentDidMount() {
        const { currentUser } = firebase.auth()

        if(!this.uid) {
          this.uid = currentUser.uid;
          this.setState({isHost:true})
        }
        else if(this.uid == currentUser.uid) this.setState({isHost:true});
        
        firebase.firestore().doc('Users/' + this.uid).get().then((value)=>{
          this.setState({ 
              currentUser,
              user: value.data(),
          })
        })

        firebase.database().ref('CurrentLocation/' + this.uid).once('value', (snapshot)=>{
          if(snapshot.val()){
              const {lastUpdate} = snapshot.val();
              this.setState({
                lastUpdate
              })
          }
        }, (e)=>console.log(e))


        
        this.refTeam.get().then((value)=>{
          value.forEach((doc)=>{
            const {Host, Members} = doc.data();
            if(Host == this.uid) {
              this.setState({
                holded: this.state.holded+1,
              })
            }
            if(Members)
              Members.map((mem)=>{
                if(mem == this.uid) {
                  this.setState({
                    attended: this.state.attended+1,
                  })
                  return;
                }
              })
          });
        })
        
        // this.ref.doc(currentUser.uid).onSnapshot((documentSnapshot)=>{
        //     console.log(documentSnapshot.data());
        // })
    }

    componentWillUnmount(){
      this.uid = null;
    }

  onCollectionUpdate = (querySnapshot) => {
    // querySnapshot.forEach((doc)=>{
    //   console.log(doc.data());
    // });
  };

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
        return 'Gần ' + Math.round(elapsed/msPerDay) + ' ngày trước';   
    }

    else if (elapsed < msPerYear) {
        return 'Gần ' + Math.round(elapsed/msPerMonth) + ' tháng trước';   
    }

    else {
        return 'Gần ' + Math.round(elapsed/msPerYear ) + ' năm trước';   
    }
  }

  render() {
    const { currentUser } = this.state;
    return (
      <Container>
        <Header  searchBar rounded>
          <Left>
            <Button transparent onPress={()=>{this.props.navigation.pop();}}>
              <Icon name='arrow-back' />
            </Button>
          </Left>
          <Body>
            <Title>{this.state.user ? this.state.user.displayName : "Hieren Lee"}</Title>
          </Body>
          <Right>
            <Button transparent>
                <Icon name='search' />
            </Button>
          </Right>
        </Header>
        <Content>
          <Card>
            <CardItem>
              <Left>
                <Thumbnail 
                  defaultSource={require('./assets/DefaultAvatar.jpg')}
                  source={this.state.user ? {uri: this.state.user.photoURL} : require('./assets/DefaultAvatar.jpg')} />
                <Body>
                  <Text>{this.state.user ? this.state.user.displayName : "Hieren Lee"}</Text>
                  {this.state.isHost && (
                    <Text note>{this.state.user ? this.state.user.email : "Loading mail..."}</Text>
                  )}
                </Body>
              </Left>
            </CardItem>
            <CardItem cardBody>
              <Thumbnail source={this.state.user ? {uri: this.state.user.photoURL} : require('./assets/DefaultAvatar.jpg')} style={{height: 400, width: null, flex: 1}}/>
            </CardItem>
            <CardItem>
              <Left>
                <Button transparent>
                  <Icon active name="ios-hand-outline" />
                  <Text>Tham gia {this.state.attended}</Text>
                </Button>
              </Left>
              <Body>
                <Button transparent>
                  <Icon active name="ios-create-outline" />
                  <Text>Tổ chức {this.state.holded}</Text>
                </Button>
              </Body>
              <Right>
                <Text>{this.timeDifference(Date.now(), this.state.lastUpdate)}</Text>
              </Right>
            </CardItem>
          </Card>
       
          <Button      rounded                    // Btn Log out
                    style={{
                        
                        justifyContent:"center",
                        alignContent:'center',
                        alignItems:"center",

                        backgroundColor:'rgb(90,164,225)',
                        fontSize: 20, 
                      marginTop:20,
                      marginLeft:Dimensions.get('window').width/4,
                      width:Dimensions.get('window').width/2,
                       
                        borderRadius:20,  
                        
                        padding:20, 
                       
                    }}
                    onPress={()=>{firebase.auth().signOut(); }}><Text>Đăng xuất</Text></Button>
                
        </Content>
      </Container>
    );
  }
}