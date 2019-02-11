import React, { Component } from 'react';
import { TextInput,TouchableOpacity, StyleSheet, Text, View, FlatList, ScrollView, Image } from 'react-native';
import axios from 'axios';
import converter from 'base64-arraybuffer';
import io from "socket.io-client";

export default class Chat extends Component {
    constructor(props) {
      super(props);
      this.state = {
        chatMessage: '',
        chatMessages: [],
        id:'1'
      };
    }

    componentDidMount() {
      this.socket = io(`http://localhost:3000/?id=' + ${this.state.id}`);
      this.socket.on('chat message', msg => {
        this.setState({ chatMessages: [...this.state.chatMessages, msg]});
      });
    }

    submitChatMessage() {
      this.socket.emit("chat message", this.state.chatMessage);
      this.setState({chatMessage: ''});
    }


    render() {
      const chatMessages = this.state.chatMessages.map((chatMessage,i) => (
        <Text key= {i}>{chatMessage}</Text>
      ));
      return (
        <View style={styles.container}>
        <TextInput
          style = {{height:40, borderWidth:2}}
          autoCorrect = {false}
          value = {this.state.chatMessage}
          onSubmitEditing = {() => this.submitChatMessage()}
          onChangeText = {chatMessage => {
            this.setState({chatMessage});
          }}
          />
          {chatMessages}
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF'
  },
});