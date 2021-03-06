import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import SwitchButton from 'switch-button-react-native';
import { Agenda } from 'react-native-calendars';
var moment = require('moment-timezone');
var axios = require('axios');
const { height, width } = Dimensions.get('window');

export default class AgendaScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: {},
      eventsAll: [],
      eventsAllObjectArr: {},
      eventsUser: [],
      eventsUserObjectArr: {},
      switch1Value: false
    };
  }

  timeToString(time) {
    let date = new Date(time);
    return date.toISOString().split('T')[0];
  }

  timeToStringTime(time) {
    let date = new Date(time);
    console.log('Here is date ', date);
    return date.toISOString().split('T')[1];
  }

  timeToStringTime(time) {
    return moment.tz(time, "America/Los_Angeles").format().split('T')[1];
  }

  async componentDidMount() {
    await axios.get('https://clubster-backend.herokuapp.com/api/user').then((response) => {
      this.setState({ eventsUser: response.data.eventsArray });
    })
    await axios.get('https://clubster-backend.herokuapp.com/api/events').then((response) => {
      this.setState({ eventsAll: response.data.events });
    })
  }

  doesEventExist = (date, _id) => {
    for (let i = 0; i < this.state.eventsUserObjectArr[date].length; i++) {
      if(this.state.eventsUserObjectArr[date][i].idOfEvent == _id) {
        return true;
      }
    }
    return false;
  }

  doesEventExistAll = (date, _id) => {
    for (let i = 0; i < this.state.eventsAllObjectArr[date].length; i++) {
      if(this.state.eventsAllObjectArr[date][i].idOfEvent == _id) {
        return true;
      }
    }
    return false;
  }

  processEvents() {
    for (let i = 0; i < this.state.eventsUser.length; i++) {
      let begDateTimestamp = this.state.eventsUser[i].date[0];
      let endDateTimestamp = this.state.eventsUser[i].date[1];
      let date = this.timeToString(begDateTimestamp);
      let timeStart = this.timeToStringTime(begDateTimestamp);
      let timeEnd = this.timeToStringTime(endDateTimestamp);
      if (!this.state.eventsUserObjectArr[date]) {
        this.state.eventsUserObjectArr[date] = [];
        this.state.eventsUserObjectArr[date].push({
          name: this.state.eventsUser[i].name,
          height: 60,
          idOfEvent: this.state.eventsUser[i]._id,
          image: this.state.eventsUser[i].image,
        });
      } else {
        if(!this.doesEventExist(date, this.state.eventsUser[i]._id)) {
          this.state.eventsUserObjectArr[date].push({
            name: this.state.eventsUser[i].name,
            height:  60,
            idOfEvent: this.state.eventsUser[i]._id,
            image: this.state.eventsUser[i].image,
          });
        }
      }
    }
    const newItems = {};
    Object.keys(this.state.eventsUserObjectArr).forEach(key => { newItems[key] = this.state.eventsUserObjectArr[key]; });
    this.setState({
      eventsUserObjectArr: newItems
    });
  }

  processEventsAll() {
    for (let i = 0; i < this.state.eventsAll.length; i++) {
      let begDateTimestamp = this.state.eventsAll[i].date[0];
      let endDateTimestamp = this.state.eventsAll[i].date[1];
      let date = this.timeToString(begDateTimestamp);
      let timeStart = this.timeToStringTime(begDateTimestamp);
      let timeEnd = this.timeToStringTime(endDateTimestamp);
      if (!this.state.eventsAllObjectArr[date]) {
        this.state.eventsAllObjectArr[date] = [];
        this.state.eventsAllObjectArr[date].push({
          name: this.state.eventsAll[i].name,
          height: 60,
          idOfEvent: this.state.eventsAll[i]._id,
          image: this.state.eventsAll[i].image,
        });
      } else {
        if(!this.doesEventExistAll(date, this.state.eventsUser[i]._id)) {
          this.state.eventsAllObjectArr[date].push({
            name: this.state.eventsAll[i].name,
            height:  60,
            idOfEvent: this.state.eventsAll[i]._id,
            image: this.state.eventsAll[i].image,
          });
        }
      }
    }
    const newItems = {};
    Object.keys(this.state.eventsAllObjectArr).forEach(key => { newItems[key] = this.state.eventsAllObjectArr[key]; });
    this.setState({
      eventsAllObjectArr: newItems
    });
  }

  toggleSwitch1 = (value) => {
    this.setState({ switch1Value: value })
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ marginTop: 6, justifyContent: 'center', alignContent: 'center', alignItems: 'center' }} >
          <SwitchButton
            onValueChange={(val) => this.setState({ activeSwitch: val })}      // this is necessary for this component
            text1='All Events'                        // optional: first text in switch button --- default ON
            text2='Your Events'                       // optional: second text in switch button --- default OFF
            switchWidth={200}                 // optional: switch width --- default 44
            switchHeight={46}                 // optional: switch height --- default 100
            switchdirection='rtl'             // optional: switch button direction ( ltr and rtl ) --- default ltr
            switchBorderRadius={140}          // optional: switch border radius --- default oval
            switchSpeedChange={500}           // optional: button change speed --- default 100
            switchBorderColor='#d4d4d4'       // optional: switch border color --- default #d4d4d4
            switchBackgroundColor='#fff'      // optional: switch background color --- default #fff
            btnBorderColor='#00a4b9'          // optional: button border color --- default #00a4b9
            btnBackgroundColor='#00bcd4'      // optional: button background color --- default #00bcd4
            fontColor='#b1b1b1'               // optional: text font color --- default #b1b1b1
            activeFontColor='#fff'            // optional: active font color --- default #fff
          />
        </View>
        {this.state.activeSwitch === 1 ?
          <Agenda
            items={this.state.eventsAllObjectArr}
            loadItemsForMonth={this.loadItemsAll.bind(this)}
            selected={Date.now()}
            renderItem={this.renderItem.bind(this)}
            renderEmptyDate={this.renderEmptyDate.bind(this)}
            rowHasChanged={this.rowHasChanged.bind(this)}
          /> :
          <Agenda
            items={this.state.eventsUserObjectArr}
            loadItemsForMonth={this.loadItems.bind(this)}
            selected={Date.now()}
            renderItem={this.renderItem.bind(this)}
            renderEmptyDate={this.renderEmptyDate.bind(this)}
            rowHasChanged={this.rowHasChanged.bind(this)}
          />}
      </View>
    );
  }

  loadItems(day) {
    this.processEvents();
  }

  loadItemsAll(day) {
    this.processEventsAll();
  }

  renderItem(item) {
    console.log(item);
    return (
      <View style={{ flexDirection: 'row' }}>
        <View style={{ backgroundColor: "#eee", borderRadius: 10, overflow: "hidden" }}>
          <View>
            <Image
              source={{
                uri: 'https://s3.amazonaws.com/clubster-123/' + item.image
              }}
              style={{
                height: 135,
                width: Dimensions.get('window').width - 70
              }}
            />
          </View>
          <View style={{ padding: 10, width: 155 }}>
            <Text>{item.name}</Text>
            <Text style={{ color: "#777", paddingTop: 5 }}>
              {item.description}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  renderEmptyDate() {
    return (
      <View style={styles.emptyDate}><Text>This is empty date!</Text></View>
    );
  }

  rowHasChanged(r1, r2) {
    return r1.name !== r2.name;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  item: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30
  },
  container: {
    ...StyleSheet.absoluteFillObject,   // fill up all screen
    justifyContent: 'flex-end',         // align popup at the bottom
    backgroundColor: 'transparent',     // transparent background
  },
  // Semi-transparent background below popup
  backdrop: {
    ...StyleSheet.absoluteFillObject,   // fill up all screen
    backgroundColor: 'black',
  },
  // Popup
  modal: {
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    margin: 20,
    marginBottom: 0,
  },
  // Movie container
  movieContainer: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: width / 2,
    flex: 1,                            // take up all available space
  },
  image: {
    borderRadius: 10,                   // rounded corners
    // fill up all space in a container
  },
  movieInfo: {
    backgroundColor: 'transparent',     // looks nicier when switching to/from expanded mode
  },
  title: {
    fontSize: 20,
  },
  genre: {
    color: '#BBBBBB',
    fontSize: 14,
  },
  sectionHeader: {
    color: '#AAAAAA',
  },
  // Footer
  footer: {
    padding: 20,
  },
  buttonContainer: {
    backgroundColor: '#673AB7',
    borderRadius: 100,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  button: {
    color: '#FFFFFF',
    fontSize: 18,
  }
});
