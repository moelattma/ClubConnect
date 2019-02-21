import React, { Component } from 'react';
import { View, Dimensions, FlatList, TouchableWithoutFeedback, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import t from 'tcomb-form-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { createStackNavigator } from 'react-navigation';
import tx from 'tcomb-additional-types';
import { ImagePicker, Permissions, Constants } from 'expo';
import { Font, AppLoading } from "expo";
const Form = t.form.Form;
import converter from 'base64-arraybuffer';
import { Container, Header, Content, Card, CardItem, Thumbnail, Text, Button, Icon, Left, Body, Right } from 'native-base';
import CommentCard from '../Cards/CommentCard';
import InformationCard from '../Cards/InformationCard';

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');

export default class EventProfile extends Component {
    constructor(props) {
        super(props);

        this.event = this.props.navigation.getParam('event', null);
        console.log(this.eventID);
    }

    componentWillMount() {
        
    }

    render() {
        return (
            <Container>
                <InformationCard event={this.event} />
                <CommentCard eventID={this.event._id} />
            </Container>
        );
    }
}

const styles = StyleSheet.create({});
