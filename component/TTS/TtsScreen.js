import React, { useState } from 'react';
import {
  Modal,
  Button,
  TextInput,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { Audio } from 'expo-av';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome';

const App = () => {
  const [text, setText] = useState('');
  const [audioUri, setAudioUri] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('as'); // Default to Assamese
  const [modalVisible, setModalVisible] = useState(false);

  const handleGenerateSpeech = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://192.168.1.10:5001/tts', {
        text: text,
        language: language, // Use selected language
      });

      if (response.data.status === 'success') {
        const audioUrl = `http://192.168.1.10:5001${response.data.audio_url}`;
        setAudioUri(audioUrl);
        setError('');
        playAudio(audioUrl);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError('Error generating speech: ' + (error.response ? error.response.data.message : error.message));
    } finally {
      setLoading(false);
    }
  };

  const playAudio = async (url) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to load or play sound', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Text to Speech</Text>
      
      {/* Language Selection Button */}
      <TouchableOpacity style={styles.languageButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.languageButtonText}>Select Language: {language}</Text>
      </TouchableOpacity>

      {/* Modal for Language Selection */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            {['as', 'hi', 'mr', 'ta', 'bn'].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={styles.languageOption}
                onPress={() => {
                  setLanguage(lang);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.languageText}>{lang === 'as' ? 'Assamese' : lang === 'hi' ? 'Hindi' : lang === 'mr' ? 'Marathi' : lang === 'ta' ? 'Tamil' : 'Bengali'}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.textInputContainer}>
        <TextInput
          placeholder="Enter text"
          placeholderTextColor="#888888"
          value={text}
          onChangeText={setText}
          style={styles.input}
        />
        <TouchableOpacity onPress={() => setText('')} style={styles.clearIcon}>
          <Icon name="times" size={20} color="#5beeee" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.generateButton} onPress={handleGenerateSpeech}>
        <Text style={styles.generateButtonText}>Generate Speech</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#5beeee" style={styles.loader} />
      ) : (
        audioUri && (
          <View style={styles.audioContainer}>
            <Icon name="play-circle" size={50} color="#5beeee" onPress={() => playAudio(audioUri)} />
            <Text style={styles.audioText}>Audio available</Text>
          </View>
        )
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp("5%"),
  },
  title: {
    color: '#ffffff',
    fontSize: wp("7%"),
    marginBottom: hp("3%"),
  },
  languageButton: {
    backgroundColor: '#5beeee',
    borderRadius: 10,
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("5%"),
    alignItems: 'center',
    marginBottom: hp("2%"),
  },
  languageButtonText: {
    fontSize: wp("5%"),
    color: '#ffffff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: wp("5%"),
    color: '#000000',
    marginBottom: hp("2%"),
  },
  languageOption: {
    paddingVertical: hp("1%"),
    width: '100%',
    alignItems: 'center',
  },
  languageText: {
    fontSize: wp("4%"),
    color: '#000000',
  },
  closeButton: {
    marginTop: hp("2%"),
    backgroundColor: '#5beeee',
    borderRadius: 10,
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("5%"),
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: wp("5%"),
    color: '#ffffff',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c2c2c',
    borderRadius: 10,
    width: '100%',
    paddingHorizontal: wp("3%"),
    paddingVertical: hp("1.5%"),
    marginBottom: hp("2%"),
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: wp("4%"),
  },
  clearIcon: {
    marginLeft: wp("2%"),
  },
  generateButton: {
    backgroundColor: '#5beeee',
    borderRadius: 10,
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("5%"),
    alignItems: 'center',
    marginBottom: hp("2%"),
  },
  generateButtonText: {
    fontSize: wp("5%"),
    color: '#ffffff',
  },
  loader: {
    marginTop: hp("2%"),
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp("2%"),
  },
  audioText: {
    color: '#ffffff',
    fontSize: wp("4%"),
    marginLeft: wp("2%"),
  },
  errorText: {
    color: 'red',
    marginTop: hp("2%"),
    fontSize: wp("4%"),
  },
});

export default App;
