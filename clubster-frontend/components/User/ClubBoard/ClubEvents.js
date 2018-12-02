import React, { Component } from 'react';
import { View, Text, Dimensions, Button, FlatList, TouchableWithoutFeedback, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import t from 'tcomb-form-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { createStackNavigator } from 'react-navigation';
import tx from 'tcomb-additional-types';
import { ImagePicker, Permissions, Constants } from 'expo';
const Form = t.form.Form;
import converter from 'base64-arraybuffer';

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');
const EVENT_WIDTH = WIDTH * 9 / 10;
const EVENT_HEIGHT = HEIGHT * 3 / 7;

const Event = t.struct({
  name: t.String,
  description: t.String,
  date: t.String,
  expense: tx.Number.Decimal
});

export default class ClubEvents extends Component {
  componentWillMount() {
    this._navListenerFocus = this.props.navigation.addListener('willFocus', () => {
      this.props.screenProps.clubBoardNav.setParams({ hideHeader: true });
    });
    this._navListenerBlur = this.props.navigation.addListener('willBlur', () => {
      this.props.screenProps.clubBoardNav.setParams({ hideHeader: false });
    });
  }

  componentWillUnmount() {
    this._navListenerFocus.remove();
    this._navListenerBlur.remove();
  }

  render() {
    const { _id, clubsterNavigation, clubBoardNav, isAdmin } = this.props.screenProps;
    return (
      <ClubEventNavigator screenProps={{ _id, clubsterNavigation, clubBoardNav, isAdmin }} />
    );
  }
}

class ShowEvents extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clubEvents: [],
      loading: false,
      idOfUser: ''
    }
  }

  static navigationOptions = ({ navigation, screenProps }) => {
    rightHeader = (
      <View style={{ marginRight: 6 }}>
        <FontAwesome
          name="plus" size={32} color={'black'}
          onPress={() => navigation.navigate('CreateClubEvent')} />
      </View>);

    return {
      headerLeft: (
        <View style={{ marginLeft: 13 }}>
          <MaterialIcons
            name="arrow-back" size={32} color={'black'}
            onPress={() => screenProps.clubBoardNav.navigate('HomeNavigation')} />
        </View>
      ),
      headerRight: (screenProps.isAdmin ? rightHeader : null)
    }
  }

  componentDidMount() {
    console.log('naah');
    this.willFocus = this.props.navigation.addListener('willFocus', () => {
      this.getClubEvents();
    });
  }

  getClubEvents() {
    console.log('hiiiii');
    const { _id } = this.props.screenProps;
    this.setState({ loading: true })
    axios.get(`http://localhost:3000/api/events/${_id}`)
      .then((response) => {
        this.setState({ clubEvents: response.data.events, idOfUser: response.data.idOfUser });
      });
    this.setState({ loading: false })
  }

  _handleGoing = (item) => {
    for(var i = 0;i<this.state.clubEvents.length;i++) {
      if(this.state.clubEvents[i]._id === item._id)
        break;
    }
    var clubEvents = this.state.clubEvents;
    var id = this.state.idOfUser;
    axios.post(`http://localhost:3000/api/events/${item._id}`).then((response) => {
      console.log(clubEvents[i].going);
      clubEvents[i].going = response.data.event.going;
      this.setState({clubEvents: clubEvents});
    })
  }

  renderButton = (item) => {
    console.log(item);
    if(item.going && item.going.indexOf(this.state.idOfUser) > -1) {
      return (
        <FontAwesome
          name="star" size={24} color={'black'} style={{ position: 'absolute', bottom: 5, right: 5 }}
          onPress={() => this._handleGoing(item)} />
      )
    } else {
      <FontAwesome
        name="star" size={24} color={'white'} style={{ position: 'absolute', bottom: 5, right: 5 }}
        onPress={() => this._handleGoing(item)} />
    }
  }

  _renderItem = ({ item }) => {
    console.log('hey ', item._id, ' plus id ', this.state.idOfUser );
    var url = 'data:image/jpeg;base64,' + converter.encode(item.image.img.data.data);
    return (
      <View style={styles.eventCard}>
          <Image source = {{uri:url}} style = {styles.eventContainer} />
          <View style = {{flexDirection: 'row'}}>
            <Text style={styles.eventTitle}> {item.name} </Text>
            <Text style = {styles.eventTitle2}>{item.date}</Text>
          </View>
          <View style = {{flexDirection: 'row'}}>
            <Text style={styles.eventTitle}> {item.description} </Text>
          </View>
          { item.going.indexOf(this.state.idOfUser) > -1 ? <FontAwesome name="star" size={24} color={'black'} style={{ position: 'absolute', bottom: 5, right: 5 }} onPress={() => this._handleGoing(item)} /> : <FontAwesome name="star" size={24} color={'white'} style={{ position: 'absolute', bottom: 5, right: 5 }} onPress={() => this._handleGoing(item)} /> }
        </View>
    );
  }

  render() {
    console.log(this.state.clubEvents.length);
    return (
      <FlatList
        data={this.state.clubEvents}
        renderItem={this._renderItem}
        keyExtractor={clubEvent => clubEvent._id}
        ItemSeparatorComponent={this.renderSeparator}
        refreshing={this.state.loading}
        onRefresh={() => this.getClubEvents()}
      />
    );
  }
}

class CreateClubEvent extends Component {

  askPermissionsAsync = async () => {
    await Permissions.askAsync(Permissions.CAMERA);
    await Permissions.askAsync(Permissions.CAMERA_ROLL);
  };

  useLibraryHandler = async () => {
    await this.askPermissionsAsync();
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      base64: false,
    });
    const token = await AsyncStorage.getItem('jwtToken');
    const data = new FormData();
    data.append('name', this._formRef.getValue().Name);
    data.append('acronym', this._formRef.getValue().Abbreviation);
    data.append('purpose', this._formRef.getValue().Purpose);
    data.append('description', this._formRef.getValue().Description);
    data.append('fileData', {
      uri: result.uri,
      type: 'multipart/form-data',
      name: "image1.jpg"
    });
    await axios.post(`http://localhost:3000/api/events/${_id}/new`, data);
    this.props.navigation.navigate('ShowEvents');
  };


  createEvent = async () => {
    var clubEventsNew = [];
    const { _id } = this.props.screenProps;
    const name = this._formRef.getValue().name;
    const date = this._formRef.getValue().date;
    const description = this._formRef.getValue().description;
    const expense = this._formRef.getValue().expense;
    await this.askPermissionsAsync();
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      base64: false,
    });
    const data = new FormData();
    data.append('name', this._formRef.getValue().name);
    data.append('date', this._formRef.getValue().date);
    data.append('description', this._formRef.getValue().description);
    data.append('expense', this._formRef.getValue().expense);
    data.append('fileData', {
      uri: result.uri,
      type: 'multipart/form-data',
      name: "image1.jpg"
    });
    await axios.post(`http://localhost:3000/api/events/${_id}/new`, data);
    this.props.navigation.navigate('ShowEvents');
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Form type={Event} ref={(ref) => this._formRef = ref} />
        <Button title="Create this Event!" onPress={() => this.createEvent()} />
      </View>
    );
  }
}

const ClubEventNavigator = createStackNavigator(
  {
    ShowEvents: { screen: ShowEvents },
    CreateClubEvent: { screen: CreateClubEvent }
  },
  {
    navigationOptions: {
      headerBackImage: (<MaterialIcons name="arrow-back" size={32} color={'black'} />),
    }
  }
)

const styles = StyleSheet.create({
  eventCard: {
    flex: 1,
    backgroundColor: 'lavender',
    marginVertical: 3,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#ddd',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 10,
  },
  eventContainer: {
    flex: 1,
    flexDirection: 'column',
    borderBottomWidth: 0,
    height: EVENT_HEIGHT,
    width: EVENT_WIDTH,
    alignSelf: 'center',
    marginTop: 25
  },
  eventTitle: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 5,
    flex: 1
  },
  eventTitle2: {
    position: 'absolute',
    right: 2,
    top: 2,
    color: 'black',
    fontWeight: 'bold',
    fontSize: 20
  }
});
