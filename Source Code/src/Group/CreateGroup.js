import React ,{Component} from 'react';
import {TextInput, Image, TouchableOpacity, StyleSheet, Alert, ViewPropTypes,Dimensions, ImageBackground} from 'react-native';
import {RadioGroup, RadioButton} from 'react-native-flexi-radio-button'
import ImagePicker from 'react-native-image-picker';
import firebase from 'react-native-firebase';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { Button, Icon, Text, Spinner, View, Container, Form, Item, Label, Input, Content } from 'native-base';

const OptionsImagePicker ={
    title: 'Lựa chọn',
    takePhotoButtonTitle:'Chụp ảnh',
    chooseFromLibraryButtonTitle:'Chọn ảnh từ bộ sưu tập',
}

const defaultCover = require('../assets/DefaultCover.jpg');//require('../assets/DefaultCover.jpg')
const createButton = require('../assets/CreateButton.png');//require('../assets/DefaultCover.jpg')

export default class  CreateGroup extends Component{


    constructor(props){
        super(props);
        this.ref = firebase.firestore().collection('Team');
        this.state = {
            confirmResult: null,
            message: '',
            teamName: '',
            teamDetail: '',
            coverImage: createButton,
            groupPrivate: false,
            startDate: new Date(),
            endDate: new Date(),
            isStartDateTimePickerVisible: false,
            isEndDateTimePickerVisible: false,
            isCreating: false,
        }
    }

    _showStartDateTimePicker = () => this.setState({ isStartDateTimePickerVisible: true });
 
    _hideStartDateTimePicker = () => this.setState({ isStartDateTimePickerVisible: false });

    _showEndDateTimePicker = () => this.setState({ isEndDateTimePickerVisible: true });

    _hideEndDateTimePicker = () => this.setState({ isEndDateTimePickerVisible: false });
    
    _handleStartDatePicked = (date) => {
        this.setState({
            startDate: date,
        })
        this._hideStartDateTimePicker();
    };

    _handleEndDatePicked = (date) => {
        this.setState({
            endDate: date,
        })
        this._hideEndDateTimePicker();
    };

    imagePicker=() =>{
        ImagePicker.showImagePicker(OptionsImagePicker, (response) => {
            console.log('Response = ', response);
          
            if (response.didCancel) {
              console.log('User cancelled image picker');
            } else if (response.error) {
              console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
              console.log('User tapped custom button: ', response.customButton);
            } else {
                // const ref = firebase.storage().ref('Cover');
                // ref.putFile(response.path)
                
                console.log(response.path);
                this.setState({
                    coverImage: 
                    {
                        uri: response.uri,
                        path: response.path,
                    }
                });
            }
        });
    }

    createGroup() {
        const {teamName, teamDetail, groupPrivate, startDate, endDate} = this.state;
        if(teamName === null || teamName === '') return;
        
        this.setState({
            isCreating: true,
        })
        
        this.ref.add({
            //Add field
          Name: teamName,
          Detail: teamDetail,
          Host: firebase.auth().currentUser.uid,
          GroupPrivate: groupPrivate,
          StartDate: startDate,
          EndDate: endDate,
        }).then((doc)=>{
            //Upload cover image
            var imageRef = firebase.storage().ref('Cover').child(doc.id);
            imageRef.putFile(this.state.coverImage.path)
                .then((succ)=>{
                    console.log('Upload Success: ')
                    console.log(succ);
                    console.log(doc);
                    //Add url image to firestore
                    doc.update('coverImage', succ.downloadURL).then(()=>{
                        this.setState({
                            teamName: '',
                            teamDetail: '',
                            coverImage: defaultCover,
                            isCreating: false,
                        });
                        this.props.navigation.pop();
                    })
                    
                })
                .catch((reason)=>{
                    doc.delete();
                    console.log(reason);
                }
                );
        });
    }

    onSelect(index, value){
        this.setState({
          groupPrivate: value
        })
    }

    formatDate(date){
        var month = date.getMonth()+1;
        return date.toLocaleTimeString('vi').substr(0, 5) + ' ' + date.getDate() + '/' + month + '/' + date.getFullYear();
    }

    render(){
        return (
            
        <Container>
            {this.state.isCreating && (<Spinner color='blue' />)}
            {!this.state.isCreating && (
            <Content>
                 <Text style={{ fontSize:15, marginTop:10}}> Chọn ảnh nhóm</Text>
            <TouchableOpacity  style={styles.InsertImage}
             onPress={this.imagePicker}>
            <ImageBackground source={defaultCover}
            style={{width:null, flex:1, height: 200}} >
                <Image style={styles.Image}
                   source={this.state.coverImage}></Image>
            </ImageBackground> 
               
               </TouchableOpacity>
                    <Form>
                        <Item rounded style={{marginTop:10}}>
                            <Input 
                                value={this.state.teamName} 
                                onChangeText={(text)=>this.setState({teamName: text})}
                                placeholder="Tên nhóm"/>
                        </Item>
                        <Item rounded style={{marginTop:10}}>
                            <Input 
                                value={this.state.teamDetail} 
                                onChangeText={(text)=>this.setState({teamDetail: text})}
                                placeholder="Mô tả"/>
                        </Item>
                    </Form>

                    <Button 
                        style={{marginTop:10}}
                        block
                        iconLeft
                        onPress={this._showStartDateTimePicker}
                    >
                        <Icon name="md-calendar"/>
                        <Text uppercase={false}>Thời gian khởi hành: {this.formatDate(this.state.startDate)}</Text>
                    </Button>
                    <DateTimePicker
                        isVisible={this.state.isStartDateTimePickerVisible}
                        onConfirm={this._handleStartDatePicked}
                        onCancel={this._hideStartDateTimePicker}
                        mode='datetime'
                        minimumDate={new Date()}
                        date={new Date()}
                    />

                    <Button 
                        style={{marginTop:10}}
                        block
                        iconLeft
                        onPress={this._showEndDateTimePicker}
                    >
                        <Icon name="md-calendar"/>
                        <Text uppercase={false}>Thời gian kết thúc: {this.formatDate(this.state.endDate)}</Text>
                    </Button>
                    <DateTimePicker
                        isVisible={this.state.isEndDateTimePickerVisible}
                        onConfirm={this._handleEndDatePicked}
                        onCancel={this._hideEndDateTimePicker}
                        mode='datetime'
                        minimumDate={this.state.startDate}
                        date={this.state.startDate}
                    />
                    <View style={styles.line2} />
                    <Text style ={styles.label}>Chế độ riêng tư</Text>
                    <View style={styles.line1} />
                    <RadioGroup onSelect = {(index, value) => this.onSelect(index, value)} selectedIndex={0}>
                        <RadioButton value={'Public'} >
                            <Text style ={styles.privacy}>Công khai</Text>
                            <Text>Bất cứ ai cũng có thể nhìn thấy nhóm của bạn, thành viên trong nhóm</Text>
                            <View style={styles.line1} />
                        </RadioButton>
            
                        <RadioButton value={'Private'}>
                            <Text style ={styles.privacy}>Bí mật</Text>
                            <Text>Chỉ những thành viên trong nhóm mới có thể nhìn thấy nhóm, thành viên cũng như lịch trình.</Text>
                        </RadioButton>
                    </RadioGroup>
                    <View style={styles.line2}></View>
                    
                    <View style ={{justifyContent:'center'}}>
                <Button rounded      
                  success block  
                  disabled={!this.state.teamName.length || this.state.coverImage == defaultCover || this.state.isCreating}     // Btn Tao nhom
                    style={{
                        alignItems:"center",
                        justifyContent:'center',
                        backgroundColor:'rgb(90,164,225)',
                        fontSize: 20, 
                        marginTop:30,
                        borderRadius:20,  
                        padding:20,
                        
                         marginLeft:Dimensions.get('window').width/4,
                        width:Dimensions.get('window').width/2,
                    }}
                    onPress={() => this.createGroup()}>
                    <Text>Tạo nhóm</Text></Button>
                    </View>

                    
                </Content>)}
            </Container>
        );  
    }
} 

const styles = StyleSheet.create({
    BackgroundHead:{
        backgroundColor:'green',
        fontSize:40,
     
        padding:10,
        
        
    },
    InsertImage:{
        marginTop:10,
        justifyContent:'center',
    
        height:200,
        backgroundColor: '#859a9b',
        borderRadius: 20,
       
    },
    Image:{
     justifyContent:'center',
   width:100,
   height:100,
    
    },
    label:{
    fontWeight:'bold',
    fontSize:13,
    margin:5,

    },
    line2 :{
        borderBottomWidth:3,
        borderBottomColor:'gray',

    },
    line1:{
        borderBottomWidth:1,
        borderBottomColor:'gray',

    },
    privacy:{
        fontSize:15, fontWeight:'bold'

    }
})