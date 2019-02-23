import React ,{Component} from 'react';
import {FlatList, Image,StyleSheet, TouchableOpacity, ImageBackground,Dimensions, ViewPropTypes} from 'react-native';
import {Container, Header, Content, Card, CardItem, Thumbnail, Text, Button, Icon, Left, Body, Right, View} from 'native-base'
import firebase from 'react-native-firebase';

class FlatListItem extends  Component{

    formatDate(date){
        var month = date.getMonth()+1;
        return date.toLocaleTimeString('vi').substr(0, 5) + ' ' + date.getDate() + '/' + month + '/' + date.getFullYear();
    }
    
    render(){
        return (
                <CardItem cardBody>
                    <ImageBackground source={{uri: this.props.item.coverImage}} style={{width:null, flex:1, height: 200,}}>
                        <Image source={require('../assets/Layer.png')} style={{width:null, flex:1, height: 200}}/>
                        <Text style={{bottom:5,left:10, color:'white', position:"absolute"}}>{this.props.item.Name}</Text>
                        <Text style={{bottom:5,right:10, color:'white', position:"absolute"}}>{this.formatDate(this.props.item.StartDate)}</Text>
                    </ImageBackground>
                </CardItem>
        );
    }
}

export default class FlatListGroup extends Component{

    constructor(props){
        super(props);
        this.ref = firebase.firestore().collection('Team');
        this.unsubscribe = function(){};
        this.state={
            loading: true,
            data: []
        }
    }

    componentDidMount(){
        this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate)
    }

    componentWillUnmount(){
        this.unsubscribe();
    }

    isAttened(Host, Members){
        var user = firebase.auth().currentUser;
        if(user.uid === Host) return true;

        if(Members)
            Members.forEach((member) => {
                if(member.uid === user.uid) return true;
            })

        return false;
    }

    onCollectionUpdate = (querySnapshot) => {
        let tmpData = [];
        querySnapshot.forEach((doc)=>{
            const { Name, Host, Detail, coverImage, GroupPrivate, Members, RequestedMembers, StartDate, EndDate } = doc.data();
            var isVisible = false;
            switch(this.props.type){
                case 'Available':
                    if((GroupPrivate === 'Public' || GroupPrivate === '' || !GroupPrivate) && 
                        !this.isAttened(Host, Members))
                        isVisible = true;
                break;
                case 'Attended':
                    if(this.isAttened(Host, Members))
                        isVisible = true;
                break;
            }
            if(EndDate < Date.now()) isVisible = false;
            if(isVisible){
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
            }
        })
        this.setState({
            loading: false,
            data: tmpData,
        })
    }

    render(){
        return( 
            <View >
                <FlatList
                    data={this.state.data}
                    showsVerticalScrollIndicator={false}
                    renderItem={({item,index}) =>
                        <TouchableOpacity onPress={()=>this.props.navigation.navigate('GroupDetail', {GroupDetail: item})}>
                            <FlatListItem item={item} index={index}/>
                        </TouchableOpacity>
                    }
                    keyExtractor={item => item.key}
                />
            </View>

        );
    }

}
const styles =StyleSheet.create({
    flatListItem:{
        color:'white',
        padding:10,
        fontSize:16,
    }
})
