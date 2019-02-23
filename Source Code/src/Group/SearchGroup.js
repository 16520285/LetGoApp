import React ,{Component} from 'react';
import {FlatList, TextInput, Image, TouchableOpacity, StyleSheet, ImageBackground, ViewPropTypes} from 'react-native';
import FlatListGroup from './FlatListGroup'
import firebase from 'react-native-firebase';
import { Fab, Icon, Button, Container, View, Text, Header, Item, Input,Footer,FooterTab,Body, Left, Right, Title,CardItem } from 'native-base';

export default class  SearchGroup extends Component{


    constructor(props){
        super(props);
        this.ref = firebase.firestore().collection('Team');
        this.state = {
            data: []
        }
    }

    componentDidMount(){
        firebase.firestore().collection('Team').get().then((value)=>{
            
            let tmpData = [];
            value.forEach((doc)=>{
                const { Name, Host, Detail, coverImage, GroupPrivate, Members, RequestedMembers, StartDate, EndDate } = doc.data();
                tmpData.push({
                    key: doc.id,
                    coverImage,
                    Name,
                    Host,
                    Detail,
                    Members,
                    RequestedMembers,
                    StartDate,
                    EndDate
                })
            })

            this.setState({
                data: tmpData,
            })
        })
    }

    fillGroup(text){
        var tmpData = this.state.data;
        tmpData.forEach((value, i)=>{
            if(!value.Name.includes(text) || !value.Detail.includes(text))
                tmpData.splice(i,1);
        })

        this.setState({
            data: tmpData
        })
    }

    formatDate(date){
        var month = date.getMonth()+1;
        return date.toLocaleTimeString('vi').substr(0, 5) + ' ' + date.getDate() + '/' + month + '/' + date.getFullYear();
    }

    render(){
        return (
            
            <Container>
            <Header searchBar rounded>
                <Item>
                    <Icon name="ios-search" />
                    <Input placeholder="Search" onChangeText={(text)=>{this.fillGroup(text)}}/>
                    <Icon name="ios-people" />
                </Item>
                <Button transparent>
                    <Icon name="ios-search" />
                </Button>
            </Header>     
            <Fab
                position='bottomRight'
                onPress={()=> this.props.navigation.navigate('CreateGroup')}
            >
                <Icon name="md-add-circle" />
            </Fab>
            
            <View >
                <FlatList
                    data={this.state.data}
                    showsVerticalScrollIndicator={false}
                    renderItem={({item,index}) =>
                        <TouchableOpacity onPress={()=>this.props.navigation.navigate('GroupDetail', {GroupDetail: item})}>
                            <CardItem cardBody>
                                <ImageBackground source={{uri: item.coverImage}} style={{width:null, flex:1, height: 200,}}>
                                    <Image source={require('../assets/Layer.png')} style={{width:null, flex:1, height: 200}}/>
                                    <Text style={{bottom:5,left:10, color:'white', position:"absolute"}}>{item.Name}</Text>
                                    <Text style={{bottom:5,right:10, color:'white', position:"absolute"}}>{this.formatDate(item.StartDate)}</Text>
                                </ImageBackground>
                            </CardItem>
                        </TouchableOpacity>
                    }
                    keyExtractor={item => item.key}
                />
            </View>

        </Container>
        );  
    }
}