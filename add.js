import React, { useEffect, useState } from "react";
import { Alert, View, TouchableOpacity, Image } from "react-native";
import { Appbar, TextInput, Button } from "react-native-paper";
import Firestore from "@react-native-firebase/firestore";
import Storage from '@react-native-firebase/storage'
import { Actions } from "react-native-router-flux"
import IconAwesome from 'react-native-vector-icons/FontAwesome5'
import ImagePicker from 'react-native-image-picker'
import RNFS from 'react-native-fs'

function Add() {
  const ref = Firestore().collection("todos");
  const [todo, setTodo] = useState("");
  const [photoList, setPhotoList] = useState([]);
  const [photoView, setPhotoView] = useState();

  useEffect(() => {
  })

  useEffect(() => {
    let photoViewArray = photoList.map((item, key) => {
      return (
        <TouchableOpacity key={'photo' + key} onLongPress={() => { warningDelete(key) }} >
          <Image style={{
            backgroundColor: "#F7F7F7", justifyContent: "center", alignItems: "center",
            borderRadius: 10, width: 80, height: 80, marginHorizontal: 5, marginVertical: 5,
            borderWidth: 1, borderColor: "#E0E0E0"
          }} source={{ uri: item.uri }} />
        </TouchableOpacity>
      )
    })
    setPhotoView(photoViewArray)
  }, [photoList]);

  async function addTodo() {
    if (todo == "") {
      await Alert.alert(
        "Warning?",
        "You must input title?",
        [{ text: "OK" }]
      )
    } else {
      await ref.add({
        title: todo,
        complete: false,
      }).then((docRef) => {
        photoList.map((item, key) => {
          uploadImage(docRef.id, key, item.uri.toString())
        })
      }).then(() => {
        Actions.home()
      })
    }
  }

  function handleChoosePhoto() {
    const options = {
      title: 'เลือกรูป',
    }
    ImagePicker.showImagePicker(options, response => {
      if (response.didCancel) {
      } else if (response.error) {
      } else if (response.customButton) {
      } else {
        setPhotoList([...photoList, { uri: response.uri }])
      }
    })
  }

  async function warningDelete(key) {
    Alert.alert(
      'Warning',
      'Are you sure to delete this image?',
      [
        {
          text: 'Delete',
          onPress: () => {
            const photoArray = photoList
            photoArray.splice(key, 1)
            setPhotoList([...photoArray])
          }
        },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        }
      ],
      { cancelable: false }
    );
  }

  async function uploadImage(docId, index, uri, mime = 'image/jpg') {
    const imageRef = Storage().ref('photos/' + docId + '/').child('image' + index.toString() + '.jpg')
    const data = await RNFS.readFile(uri, 'base64')
    await imageRef.putString(data, 'base64')
      .then(() => { return imageRef.getDownloadURL() })
      .then((url) => {
        ref.doc(docId).collection('photos').add({
          title: 'image' + index.toString() + '.jpg',
          url: url
        })
      })
  }

  return (
    <>
      <Appbar>
        <Appbar.Content title={"เพิ่มงานที่ต้องทำ"} />
      </Appbar>
      <View>
        <View style={{ flexDirection: "row", flexWrap: 'wrap', alignItems: 'stretch' }}>
          {photoView}
          {(photoList.length < 3) ?
            <View style={{
              backgroundColor: "#F7F7F7", justifyContent: "center", alignItems: "center",
              borderRadius: 10, width: 80, height: 80, marginHorizontal: 5, marginVertical: 5,
              borderWidth: 1, borderColor: "#E0E0E0"
            }}>
              <TouchableOpacity onPress={handleChoosePhoto}>
                <IconAwesome name="plus-circle" size={40} backgroundColor="#FFFFFF" color="#FF0000" />
              </TouchableOpacity>
            </View> : null
          }
        </View>
      </View>
      <TextInput label={"สร้างงานใหม่"} value={todo} onChangeText={setTodo} />
      <Button onPress={() => addTodo()}>Add TODO</Button>
    </>
  )
};

export default Add;