// Gallery.js
import React, { Component } from 'react';
import { FlatList, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import { Font, ImagePicker, Permissions, Constants } from 'expo';
import ImageViewer from 'ImageViewer';
import GalleryImage from './GalleryImage';
import { Container, Header, Content, Card, CardItem, Text, Body } from "native-base";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { accessKeyId, secretAccessKey } from '../../../keys/keys';
import v1 from 'uuid/v1';
import axios from 'axios';
import { RNS3 } from 'react-native-aws3';

const { WIDTH, HEIGHT } = Dimensions.get('window');

export default class Gallery extends Component {
  constructor(props) {
    super(props);

    const { galleryID, photos } = props;

    this.state = {
      galleryID: galleryID,
      photos: photos
    };
  }

  askPermissionsAsync = async () => {
      await Permissions.askAsync(Permissions.CAMERA);
      await Permissions.askAsync(Permissions.CAMERA_ROLL);
  };

  onSubmit = async (item = null) => {
    await this.askPermissionsAsync();
    try {
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            base64: false,
        });
        if (result.cancelled)
            return;

        const key = `${v1()}.jpeg`;
        const file = {
            uri: result.uri,
            type: 'image/jpeg',
            name: key
        };
        const options = {
            keyPrefix: 's3/',
            bucket: 'clubster-123',
            region: 'us-east-1',
            accessKey: accessKeyId,
            secretKey: secretAccessKey,
            successActionStatus: 201
        }
        var imageURL;
        var removeImageURL = item;
        await RNS3.put(file, options).then((response) => {
            imageURL = response.body.postResponse.key;
        }).catch((err) => { console.log(err) });
        axios.post(`http://localhost:3000/api/galleries/${this.state.galleryID}/newPhoto`, { imageURL, removeImageURL }).then((response) => {
          const { photos } = this.state;
          var newPhotos = [];
          if (removeImageURL) {
            photos.map((photo, indx) => {
              if (indx > 6 ) {}
              else if (photo != removeImageURL) 
                newPhotos.push(photo);
              else newPhotos.push(imageURL);
            });
          } else {
            photos.map(photo => {
              newPhotos.push(photo);
            });
            if (newPhotos.length == 6 && !newPhotos[5].addPhotoIcon)
              console.log("too many photos!");
            newPhotos[newPhotos.length - 1] = imageURL;
            if (newPhotos.length < 6)
              newPhotos.push({ addPhotoIcon: true })
          }
          this.setState({ photos: newPhotos });
          this.props.onUpdatePhotos(newPhotos);
        })
    } catch (error) { console.log(error); }
  }

  _renderItem = ({ item, index }) => {
    if (item.addPhotoIcon)
      return <FontAwesome name="plus" size={18} color={'black'} onPress = {() => this.onSubmit()} />;
    return (
      <GalleryImage
        index={index}
        key={index}
        uri={'https://s3.amazonaws.com/clubster-123/' + item}
        onPress={() => this.onSubmit(item)}
      />
    )
  }

  render() {
    return (
      <FlatList
        contentContainerStyle={{ width: WIDTH, alignItems: 'center', alignContent: 'center', justifyContent: 'center' }}
        data={this.state.photos}
        renderItem={this._renderItem}
        numColumns={3}
        keyExtractor={photo => photo}
        horizontal={false}  
      />
    );
  }
}

/*<View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}
          >
            {this.state.images.map((image, idx) => {
                return (<GalleryImage
                  index={idx}
                  key={idx}
                  onPress={this.showLightbox}
                  uri={'https://s3.amazonaws.com/clubster-123/' + image}
                />
              )}
            )}
            <ImageViewer
              shown={shown}
              imageUrls={images}
              onClose={this.hideLightbox}
              index={index}
            />
          </View>*/
