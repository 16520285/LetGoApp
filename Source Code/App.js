import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import CreateGroup from './src/Group/CreateGroup';
import AvailableGroup from './src/Group/AvailableGroup';
import JoinedGroup from'./src/Group/JoinedGroup';
import LoginScreen from './src/Login';
import LoadingScreen from './src/Loading';
import AddPhoneNumberScreen from './src/AddPhoneNumber';
import ProfileScreen from './src/Profile';
import GroupDetailScreen from './src/Group/GroupDetail';
import SearchGroupScreen from './src/Group/SearchGroup';
import MapScreen from './src/Map'

var MainScreenTabNavigator = createBottomTabNavigator({
  AvailableGroup: AvailableGroup,
  JoinedGroup: JoinedGroup,
},
{
  swipeEnabled: true,
  tabBarOptions:{
    showIcon: true,
    activeBackgroundColor: 'blue',
    style: {
      backgroundColor: '#62B1F6',
    },
    showLabel:false,
  }
});

MainScreenTabNavigator.navigationOptions={
  title:  "Nhóm"
}

export default createStackNavigator({
    Loading: LoadingScreen,
    Login: {
      screen: LoginScreen,
      navigationOptions:{
        header: null,
      }
    },
    AddPhoneNumber: AddPhoneNumberScreen,
    TeamView: {
      screen: MainScreenTabNavigator,
      navigationOptions:{
        header: null,
      }
    },
    CreateGroup:  {
      screen: CreateGroup,
      navigationOptions:{
        header: null,
      }
    },
    MapView: {
      screen: MapScreen
    },
    Profile: {
      screen: ProfileScreen,
      navigationOptions:{
        header: null,
      }
    },
    SearchGroup: {
      screen: SearchGroupScreen,
      navigationOptions:{
        header: null,
      }
    },
    GroupDetail: GroupDetailScreen,
  },{
      initialRouteName: 'Login',
  });
