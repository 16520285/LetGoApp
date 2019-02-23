import React ,{Component} from 'react';
import {Header, Item, Icon, Text, View, Button,Input,Fab, Body, Left, Right, Title, Container, ViewPropTypes} from 'native-base'
import FlatListGroup from './FlatListGroup'

export default class  JoinedGroup extends Component{
    static navigationOptions = {
        tabBarIcon: ()=>{return <Icon name="md-checkbox-outline" style={{color: '#fff'}}/>},
    }
    render() {
        return (
        <Container style={{marginBottom:55}}>    
            <Header>
                <Body>
                    <Title>Nhóm đang tham gia</Title>
                </Body>
                <Right>
                    <Button transparent onPress={()=> this.props.navigation.navigate('SearchGroup')}>
                        <Icon name='search' />
                    </Button>
                    <Button transparent onPress={()=>{this.props.navigation.navigate('Profile', {uid:null})}}>
                        <Icon name='ios-contact' />
                    </Button>
                </Right>
            </Header>   
            <FlatListGroup style={{marginBottom:50}} type='Attended' navigation={this.props.navigation}/>
        </Container>
      );
    }
}