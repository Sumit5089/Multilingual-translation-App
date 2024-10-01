import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, Modal, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import * as Print from 'react-native-print';  // Importing react-native-print for PDF creation

const UploadScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [documentUri, setDocumentUri] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translatedText, setTranslatedText] = useState('');
  const [translationLoading, setTranslationLoading] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'mr', name: 'Marathi' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' },
    { code: 'te', name: 'Telugu' },
    { code: 'ml', name: 'Malayalam' },
  ];

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const { uri } = result.assets[0];
      setImageUri(uri);
      extractTextFromImage(uri);
    } else {
      Alert.alert('No image selected');
    }
  };

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Allows all document types
      });
  
      console.log('Document Picker Result:', result); // Debugging line
  
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const { uri } = result.assets[0];
        setDocumentUri(uri); // Ensure this state variable exists
        extractTextFromDocument(uri); // Call your function to extract text
      } else {
        Alert.alert('No document selected. Please try again.');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error selecting document.');
    }
  };

  const extractTextFromImage = async (uri) => {
    setLoading(true);
    try {
      const apiKey = 'K83589140488957'; 
      const formData = new FormData();
      formData.append('apikey', apiKey);
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'image.jpg',
      });

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      if (result && result.ParsedResults && result.ParsedResults.length > 0) {
        const extractedText = result.ParsedResults[0].ParsedText;
        setExtractedText(extractedText);
        translateText(extractedText);
      } else {
        Alert.alert('No text found in image.');
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      Alert.alert('Error extracting text.');
    } finally {
      setLoading(false);
    }
  };

  const extractTextFromDocument = async (uri) => {
    setLoading(true);
    try {
      const apiKey = 'K83589140488957'; // Replace with your API key
      const formData = new FormData();
      formData.append('apikey', apiKey);
      formData.append('file', {
        uri,
        type: 'application/pdf',
        name: 'document.pdf',
      });

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      if (result && result.ParsedResults && result.ParsedResults.length > 0) {
        const extractedText = result.ParsedResults[0].ParsedText;
        setExtractedText(extractedText);
        translateText(extractedText);
      } else {
        Alert.alert('No text found in document.');
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      Alert.alert('Error extracting text.');
    } finally {
      setLoading(false);
    }
  };

  const translateText = async (text) => {
    setTranslationLoading(true);
    try {
      const response = await axios.post('http://192.168.1.10:5000/translate', {
        text: text,
        from: 'en',
        to: selectedLanguage,
      });
      setTranslatedText(response.data.translation);
    } catch (error) {
      console.error('Error translating text:', error);
      Alert.alert('Error translating text.');
    } finally {
      setTranslationLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const htmlContent = `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1E90FF; }
            p { font-size: 16px; }
          </style>
        </head>
        <body>
          <h1>Translated Text</h1>
          <p>${translatedText}</p>
        </body>
        </html>
      `;
      await Print.printToFileAsync({
        html: htmlContent,
        fileName: 'TranslatedDocument.pdf',
      });
      Alert.alert('PDF created and ready to download');
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error creating PDF.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image and Document Translator</Text>

      {/* Translate To Button with selected language */}
      <TouchableOpacity
        style={styles.translateButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.translateButtonText}>Translate To: {languages.find(lang => lang.code === selectedLanguage)?.name}</Text>
      </TouchableOpacity>

      {/* Language Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Select Language</Text>
          <FlatList
            data={languages}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.languageOption}
                onPress={() => {
                  setSelectedLanguage(item.code);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.languageText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* Upload Image Button */}
      <TouchableOpacity style={styles.uploadButton} onPress={handleImagePick}>
        <Text style={styles.uploadButtonText}>Upload Image</Text>
      </TouchableOpacity>

      {/* Upload Document Button */}
      <TouchableOpacity style={styles.uploadButton} onPress={handleDocumentPick}>
        <Text style={styles.uploadButtonText}>Upload Document</Text>
      </TouchableOpacity>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
      )}

      {loading && !translationLoading ? (
        <ActivityIndicator size="large" color="#fff" style={styles.loader} />
      ) : translationLoading ? (
        <ActivityIndicator size="large" color="#fff" style={styles.loader} />
      ) : (
        extractedText ? (
          <Text style={styles.extractedText}>{translatedText}</Text>
        ) : null
      )}

      {/* Download PDF Button */}
      {translatedText && (
        <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadPDF}>
          <Text style={styles.downloadButtonText}>Download as PDF</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  downloadButton: {
    backgroundColor: '#32CD32',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  translateButton: {
    backgroundColor: '#FFA500',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  translateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    marginVertical: 10,
  },
  extractedText: {
    color: '#fff',
    fontSize: 16,
    marginVertical: 20,
  },
  modalView: {
    backgroundColor: '#fff',
    marginTop: 100,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 20,
  },
  languageOption: {
    padding: 10,
  },
  languageText: {
    fontSize: 16,
  },
  loader: {
    marginVertical: 20,
  },
});

export default UploadScreen;
