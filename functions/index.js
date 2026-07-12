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
      let voiceName = 'th-TH-Neural2-C'; // ลุงสมชาย (Male)
      let gender = 'MALE';
      
      if (voiceProfile === 'female') {
        voiceName = 'th-TH-Standard-A';
        gender = 'FEMALE';
      } else if (voiceProfile === 'child') {
        voiceName = 'th-TH-Standard-A'; // Thai TTS lacks child voice, use high pitch later
        gender = 'FEMALE';
      }

      let pitch = 0.0;
      if (voiceProfile === 'child') pitch = 5.0;
      else if (voiceProfile.includes('male')) pitch = -7.0; // Fake a male voice by dropping pitch

      const request = {
        input: { text: text },
        voice: { languageCode: 'th-TH', name: voiceName },
        audioConfig: { 
          audioEncoding: 'MP3',
          pitch: pitch,
          speakingRate: voiceProfile === 'old_male' ? 0.9 : 1.0
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
