import React ,{Component} from 'react';
import FlatListGroup from './FlatListGroup'
import { Fab, Icon, Button, Container, View, Text, Header, Item, Input,Footer,FooterTab,Body, Left, Right, Title } from 'native-base';



export default class  AvailableGroup extends Component{
 
    static navigationOptions = {
        tabBarIcon: ()=>{return <Icon name="md-bicycle" style={{color: '#fff'}}/>},
    }

    constructor(props){
        super(props);
    }
   
    render() { 
        
        return (
            <Container style={{marginBottom:55}}>
                <Header>
                <Body>
                    <Title>Những nhóm phượt mới</Title>
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
                <FlatListGroup type='Available' navigation={this.props.navigation}/>
                <Fab
                    position='bottomRight'
                    onPress={()=> this.props.navigation.navigate('CreateGroup')}
                >
                    <Icon name="md-add-circle" />
                </Fab>

            </Container>
        );
    }
}