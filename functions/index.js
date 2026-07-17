const { onRequest } = require('firebase-functions/v2/https');
const textToSpeech = require('@google-cloud/text-to-speech');
const cors = require('cors')({ origin: true });

// Initializes the TTS client. Automatically uses Application Default Credentials.
const client = new textToSpeech.TextToSpeechClient();

exports.synthesizeSpeech = onRequest({ cors: true, region: "us-central1" }, async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

    try {
      const { text, voiceProfile } = req.body;
      
      if (!text) {
        return res.status(400).send('Text is required');
      }

      // Voice Mapping Database
      let voiceName = 'th-TH-Neural2-C'; // Default Male
      let pitch = 0.0;
      let speakingRate = 1.0;

      const profile = voiceProfile || 'old_male';
      const isFemale = profile.includes('female');
      const isChild = profile.includes('child') || profile.includes('เด็ก');
      const isOld = profile.includes('old') || profile.includes('แก่');

      if (isFemale) {
        voiceName = 'th-TH-Standard-A'; // Female voice
      } else {
        voiceName = 'th-TH-Neural2-C'; // Male voice
      }

      // Adjust pitch and rate based on age
      if (isChild) {
        pitch = 6.0;
        speakingRate = 1.15;
      } else if (isOld) {
        pitch = -5.0;
        speakingRate = 0.85;
      }

      const request = {
        input: { text: text },
        voice: { languageCode: 'th-TH', name: voiceName },
        audioConfig: { 
          audioEncoding: 'MP3',
          pitch: pitch,
          speakingRate: speakingRate
        },
      };

      const [response] = await client.synthesizeSpeech(request);
      
      res.set('Content-Type', 'audio/mp3');
      res.status(200).send(Buffer.from(response.audioContent, 'binary'));
    } catch (error) {
      console.error('Error generating speech:', error);
      res.status(500).send(error.toString());
    }
});
