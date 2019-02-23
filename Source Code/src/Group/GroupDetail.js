import React ,{Component} from 'react';
import {Image, Alert, ListView, StyleSheet, ViewPropTypes } from 'react-native';
import {Container, Header, Content, Card, CardItem, 
        Thumbnail, Text, Button, Icon, Left, Body, 
        Fab, InputGroup, Right, List, ListItem, Tabs, Tab, 
        TabHeading, View, Grid, H2} from 'native-base'
import firebase from 'react-native-firebase'

const defaultCover = require('../assets/DefaultCover.jpg');

export default class GroupDetail extends Component {

    static navigationOptions = {
        title: 'Chi tiết',
    }

    constructor(props){
        super(props);
        this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        this.Detail = this.props.navigation.getParam('GroupDetail', null);
        this.currentUser = firebase.auth().currentUser;
        this.refUser = firebase.firestore().collection('Users');
        this.refTeam = firebase.firestore().collection('Team');
        this.restDate = new Date();
        this.state = {
            isStart: false,
            isEnd: false,
            isHost: false,
            isAttended: false,
            sentRequest: false,
            listMembers: [],
            listRequestedMembers: [],
            hostDetail: null
        }
    }

    componentDidMount(){
        const {Host, Members, RequestedMembers, StartDate} = this.Detail;
        this.refUser.doc(Host).get().then(value => this.setState({
            hostDetail: value.data()
        }));
        if(this.Detail.EndDate < new Date()){
            this.setState({
                isEnd: true,
                isStart: true,
            })
        }else if(this.Detail.StartDate < new Date()){
            this.setState({
                isStart: true,
            })
        }

        this.loadUser(Members, RequestedMembers);

        //Check user attended
        if(this.currentUser.uid === Host) {
            this.setState({
                isAttended: true,
                isHost: true,
            })
            return;
        }
        if(Members){
            Members.forEach((member)=>{
                if(this.currentUser.uid === member) {
                    this.setState({
                        isAttended: true,
                    })
                    return;
                }
            })
        }
        
        //Check user requested
        if(RequestedMembers){
            RequestedMembers.forEach((member)=>{
                if(this.currentUser.uid === member){
                    this.setState({
                        isAttended: false,
                        sentRequest: true,
                    })
                }
            })
        }

    }

    loadUser(members, requestedMembers){
        var {listMembers, listRequestedMembers} = this.state;
        if(members)
            members.forEach((uid)=>{
                this.refUser.doc(uid).get().then((doc)=>{
                    const { displayName, email, photoURL } = doc.data();
                    listMembers.push({
                        uid,
                        displayName,
                        email,
                        photoURL,
                    })
                    this.setState({listMembers})
                });
            })

        if(requestedMembers)
            requestedMembers.forEach((uid)=>{
                this.refUser.doc(uid).get().then((doc)=>{
                    const { displayName, email, photoURL } = doc.data();
                    listRequestedMembers.push({
                        uid,
                        displayName,
                        email,
                        photoURL,
                    })
                    this.setState({listRequestedMembers})
                });
            })
    }

    sendRequest(){
        if(this.state.isAttended) return;
        if(this.state.sentRequest) { //If request sent, remove request
            this.removeRequest();
            return;
        }

        Alert.alert(
            'Xác nhận',
            'Nếu tham gia nhóm, người quản lý sẽ biết số điện thoại của bạn và vị trí của bạn khi chuyến đi bắt đầu. \n\nBạn có chắc chắn muốn tham gia nhóm này?',
            [
              {text: 'Huỷ', style: 'cancel'},
              {text: 'OK', onPress: () => {
                var { RequestedMembers } = this.Detail;
        
                if(RequestedMembers)
                    RequestedMembers.push(this.currentUser.uid);
                else RequestedMembers = [this.currentUser.uid];
        
        
                this.refTeam.doc(this.Detail.key).update('RequestedMembers', RequestedMembers);
                this.setState({
                    sentRequest: true,
                })}},
            ],
            { cancelable: false }
        );
    }

    removeRequest(){
        if(this.state.isAttended || !this.state.sentRequest) return;

        Alert.alert(
            'Xác nhận',
            'Bạn có chắc chắn muốn rời nhóm?',
            [
                {text: 'Huỷ', style: 'cancel'},
                {text: 'OK', onPress: () => {
                    var { RequestedMembers } = this.Detail;
            
                    if(RequestedMembers)
                        RequestedMembers.splice(RequestedMembers.indexOf(this.currentUser.uid),1);
            
                    this.refTeam.doc(this.Detail.key).update('RequestedMembers', RequestedMembers);
                    this.setState({
                        sentRequest: false,
                    })
                }},
            ],
            { cancelable: false }
        );
    }

    removeRequestForHost(userData){
        if(!this.state.isHost) return; //Check host
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc chắn muốn huỷ yêu cầu này?',
            [
                {text: 'Không', style: 'cancel'},
                {text: 'Có', onPress: () => {
                    var { RequestedMembers } = this.Detail;
                    var { listRequestedMembers } = this.state;
            
                    if(RequestedMembers)
                        RequestedMembers.splice(RequestedMembers.indexOf(userData.uid),1);
            
                    this.refTeam.doc(this.Detail.key).update('RequestedMembers', RequestedMembers).then(value=>{
                        listRequestedMembers.splice(listRequestedMembers.indexOf(userData), 1);
                        this.setState(listRequestedMembers);
                    })
                }},
            ],
            { cancelable: false }
        );
    }

    deleteGroup(){
        if(!this.state.isHost) return; //Check host

        Alert.alert(
            'Xác nhận',
            'Bạn có chắc chắn muốn xoá nhóm này?',
            [
                {text: 'Không', style: 'cancel'},
                {text: 'Có', onPress: () => {
                    var docId = this.Detail.key;
                    this.refTeam.doc(docId).delete().then(()=>{
                        this.props.navigation.pop();
                    }).catch(reason=>{
                        console.log(reason);
                    });
                    // this.props.navigation.pop();
                }},
            ],
            {cancelable: false}
        )
    }

    acceptRequest(userData){
        if(!this.state.isHost) return; //Check host

        Alert.alert(
            'Xác nhận',
            'Bạn có chắc chắn muốn thêm người này vào nhóm?',
            [
                {text: 'Không', style: 'cancel'},
                {text: 'Có', onPress: () => {
                    var { listMembers, listRequestedMembers } = this.state;
                    var { Members, RequestedMembers } = this.Detail;

                    //Delete row in request list
                    RequestedMembers.splice(RequestedMembers.indexOf(userData.uid), 1);

                    this.refTeam.doc(this.Detail.key).update('RequestedMembers', RequestedMembers).then((value)=>{
                        listRequestedMembers.splice(listRequestedMembers.indexOf(userData), 1);
                        this.setState({listRequestedMembers});
                    })

                    //Add row in member list
                    if(Members)
                        Members.push(userData.uid);
                    else Members = [userData.uid];

                    this.refTeam.doc(this.Detail.key).update('Members', Members).then((value)=>{
                        listMembers.push(userData);
                        this.setState(listMembers);
                    })
                }},
            ],
            { cancelable: false }
        );
    }

    deleteMember(userData){
        if(!this.state.isHost) return; //Check host

        Alert.alert(
            'Xác nhận',
            'Bạn có chắc chắn muốn xoá người này khỏi nhóm?',
            [
                {text: 'Không', style: 'cancel'},
                {text: 'Có', onPress: () => {
                    var { listMembers, listRequestedMembers } = this.state;
                    var { Members, RequestedMembers } = this.Detail;

                    //Delete row in member list
                    var i = Members.indexOf(userData.uid);
                    if(i !== -1)
                        Members.splice(i, 1);

                    this.refTeam.doc(this.Detail.key).update('Members', Members).then((value)=>{
                        var i = listMembers.indexOf(userData);
                        if(i !== -1)
                            listMembers.splice(i, 1);
                        this.setState(listMembers);
                    })
                }},
            ],
            { cancelable: false }
        );
    }

    formatDate(date){
        var month = date.getMonth()+1;
        return date.toLocaleTimeString('vi').substr(0, 5) + ' ' + date.getDate() + '/' + month + '/' + date.getFullYear();
    }

    render(){
        return(
            <Container>
                <Content>
                    <Card style={{flex: 0}}>
                        <CardItem>
                            <Left>
                                <Thumbnail source={this.state.hostDetail && this.Detail.coverImage
                                    ? {uri: this.state.hostDetail ? this.state.hostDetail.photoURL : this.Detail.coverImage ? this.Detail.coverImage : ''} 
                                    : defaultCover} />
                                <Body>
                                    <Text uppercase>{this.Detail.Name}</Text>
                                    <Text note>{this.state.hostDetail ? this.state.hostDetail.displayName : "..."}</Text>
                                    {/* <Text note>{this.Detail.StartDate ? this.formatDate(this.Detail.StartDate) : "Coming Soon"}</Text>
                                    <Text note>{this.Detail.EndDate ? this.formatDate(this.Detail.EndDate) : ""}</Text> */}
                                </Body>
                            </Left>
                        </CardItem>
                        <CardItem>
                        <Body>
                            <Image source={this.Detail.coverImage ? {uri: this.Detail.coverImage} : defaultCover} style={{height: 200, width: undefined, alignSelf: 'stretch', flex: 1}}/>
                            <Card style={{flex: 1, alignSelf: 'stretch', width: undefined}}>
                                {/* <CardItem header bordered>
                                    <Text>Thông tin</Text>
                                </CardItem> */}
                                <CardItem>
                                    <Text>
                                        {this.Detail.Detail}
                                    </Text>
                                </CardItem>
                            </Card>
                            <Text note style={{alignSelf: 'center'}}>{this.formatDate(this.Detail.StartDate)} - {this.formatDate(this.Detail.EndDate)}</Text>
                        </Body>
                        </CardItem>
                        <CardItem>
                        <Left>
                            <Button transparent info>
                                <Icon name="ios-contacts" />
                                <Text>{this.state.listMembers ? this.state.listMembers.length : 0} thành viên</Text>
                            </Button>
                        </Left>
                        <Right>
                            {!this.state.isAttended && !this.state.isStart &&
                            (<Button iconLeft bordered={!this.state.sentRequest} info
                            onPress={() => this.state.sentRequest ? this.removeRequest() : this.sendRequest()}>
                                <Icon name={this.state.sentRequest ? "md-close" : "md-add"} />
                                <Text uppercase={false}>{this.state.sentRequest ? "Huỷ yêu cầu" : "Tham gia"}</Text>
                            </Button>)}
                            <Grid>
                                {this.state.isStart && !this.state.isEnd &&
                                (<Button icon bordered info
                                    onPress={()=>{this.props.navigation.navigate('MapView', { 
                                        ListMember: this.state.listMembers,
                                        host: this.Detail.Host
                                    })
                                }}>
                                    <Icon name='md-locate' />
                                </Button>)}
                            {/* {this.state.isHost && 
                            (
                                <Button icon bordered warning style={{marginLeft: 10}}
                                    onPress={()=>{}}>
                                    <Icon name='md-build' />
                                </Button>
                            )} */}
                            {this.state.isHost && 
                                (
                            <Button icon bordered danger style={{marginLeft: 10}}
                                onPress={()=>this.deleteGroup()}>
                                <Icon name='ios-trash' />
                            </Button>
                                )}
                            </Grid>
                        </Right>
                        </CardItem>
                    </Card>
                    {this.state.isHost ? this.listMemberForHost() : this.listMemberForNormal()}
                </Content>
            </Container>
        );
    }

    listMemberForNormal(){
        return(
            <List
            leftOpenValue={75}
            rightOpenValue={-75}
            dataSource={this.ds.cloneWithRows(this.state.listMembers)}
            renderRow={data =>
              <ListItem avatar>
                <Left  style={{marginLeft: 20}}>
                    <Thumbnail source={{ uri: data.photoURL }} />
                </Left>
                <Body>
                    <Text> {data.displayName} </Text>
                </Body>
              </ListItem>}
            renderLeftHiddenRow={data =>
              <Button full onPress={() => this.props.navigation.navigate('Profile', {uid: data.uid})}>
                <Icon active name="information-circle" />
              </Button>}
            renderRightHiddenRow={(data) =>
                {if (this.state.isHost) { 
                    return(
                        <Button full danger onPress={() => this.deleteMember(data)}>
                            <Icon active name="trash" />
                        </Button>)
                    }
                }}
            />
        );
    }

    listMemberForHost(){
        return(
            <Tabs locked>
                <Tab tabStyle={styles.TabItem} heading={ <TabHeading><Icon name="md-contacts" /><Text>Members</Text></TabHeading>}>
                    {this.listMemberForNormal()}
                </Tab>
                <Tab tabStyle={styles.TabItem} heading={ <TabHeading><Icon name="md-checkmark-circle-outline" /><Text>Requesting</Text></TabHeading>}>
                    <List
                        leftOpenValue={75}
                        rightOpenValue={-75}
                        dataSource={this.ds.cloneWithRows(this.state.listRequestedMembers)}
                        renderRow={data =>
                            <ListItem avatar>
                                <Left  style={{marginLeft: 20}}>
                                    <Thumbnail source={{ uri: data.photoURL }} />
                                </Left>
                                <Body>
                                    <Text> {data.displayName} </Text>
                                </Body>
                            </ListItem>}
                        renderLeftHiddenRow={data =>
                            <Button full onPress={() => this.acceptRequest(data)} success>
                                <Icon active name="ios-checkmark-circle" />
                            </Button>}
                        renderRightHiddenRow={(data, secId, rowId, rowMap) =>
                            <Button full danger onPress={()=>this.removeRequestForHost(data)}>
                                <Icon active name="trash" />
                            </Button>}
                    />
                </Tab>
            </Tabs>);
    }
}

const styles =StyleSheet.create({
    TabItem:{
        backgroundColor: 'green'
    }
})