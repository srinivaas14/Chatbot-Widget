/* eslint-disable no-unused-vars */
/* eslint-disable no-alert */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable camelcase */
/* eslint-disable no-console */
/* eslint-disable no-undef */

// Expose globally your audio_context, the recorder instance and audio_stream
let audio_context;
let recorder;
let audio_stream;
const API_KEY = '';

/**
 * Patch the APIs for every browser that supports them and check
 * if getUserMedia is supported on the browser.
 *
 */
function Initialize() {
  try {
    // Monkeypatch for AudioContext, getUserMedia and URL
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia =
      navigator.getUserMedia || navigator.webkitGetUserMedia;
    window.URL = window.URL || window.webkitURL;

    // Store the instance of AudioContext globally
    audio_context = new AudioContext();
    console.log('Audio context is ready !');
    console.log(
      `navigator.getUserMedia ${
        navigator.getUserMedia ? 'available.' : 'not present!'
      }`,
    );
  } catch (e) {
    alert('No web audio support in this browser!');
  }
}

/**
 * Stops the recording process. The method expects a callback as first
 * argument (function) executed once the AudioBlob is generated and it
 * receives the same Blob as first argument. The second argument is
 * optional and specifies the format to export the blob either wav or mp3
 */
function stopRecording(callback, AudioFormat) {
  // Stop the recorder instance
  recorder && recorder.stop();
  console.log('Stopped recording.');

  // Stop the getUserMedia Audio Stream !
  audio_stream.getAudioTracks()[0].stop();

  // Use the Recorder Library to export the recorder Audio as a .wav file
  // The callback providen in the stop recording method receives the blob
  if (typeof callback === 'function') {
    /**
     * Export the AudioBLOB using the exportWAV method.
     * Note that this method exports too with mp3 if
     * you provide the second argument of the function
     */
    recorder &&
      recorder.exportWAV((blob) => {
        callback(blob);
        // Clear the Recorder to start again !
        recorder.clear();
        console.log('audio cleared');
      }, AudioFormat || 'audio/wav');
  }
}

function stopRecordInterval() {
  // This function is used to stop recording after some time of interval

  const _AudioFormat = 'audio/wav';
  stopRecording((AudioBLOB) => {
    $('#recordButton').removeClass('recording');
    $('#recordButton').hide();
    $('#loader').show();
    const reader = new FileReader();
    reader.readAsDataURL(AudioBLOB);

    // convert AudioBlob to base64 encoding
    reader.onloadend = function () {
      const base64data = reader.result.split(',')[1];

      const settings = {
        url: `https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`,
        method: 'POST',
        timeout: 0,
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify({
          config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 44100,
            languageCode: 'en-US',
          },
          audio: { content: base64data },
        }),
      };

      $.ajax(settings).done((response) => {
        if (Object.hasOwnProperty.call(response, 'results')) {
          const { results } = response;
          const user_message = results[0].alternatives[0].transcript;
          setUserResponse(user_message);
          send(user_message);
        } else {
          display_message = 'Sorry some error has occured';
          console.log(
            'error occured while performing STT operations',
            response,
          );
        }
        $('#userInput').prop('disabled', false);
      });
    };
  }, _AudioFormat);
}

/**
 * Starts the recording process by requesting the access to the microphone.
 * Then, if granted proceed to initialize the library and store the stream.
 *
 * It only stops when the method stopRecording is triggered.
 */
function startRecording() {
  // Access the Microphone using the navigator.getUserMedia method to obtain a stream
  navigator.getUserMedia(
    { audio: true },
    (stream) => {
      // Expose the stream to be accessible globally
      audio_stream = stream;

      // Create the MediaStreamSource for the Recorder library
      const input = audio_context.createMediaStreamSource(stream);
      console.log('Media stream succesfully created', input);

      // Initialize the Recorder Library
      recorder = new Recorder(input, { numChannels: 1 });
      console.log('Recorder initialised', recorder);

      // Start recording !
      recorder && recorder.record();
      console.log('Recording...');
    },
    (e) => {
      console.error(`No live audio input: ${e}`);
    },
  );
}
$('#microPhone').on('click', (e) => {
  console.log('micrphone clicked');
  const isRecording = $('#microPhone').attr('recording');
  // toggle tge record button
  if (isRecording === 'true') {
    // if user has stop recording
    stopRecordInterval();
    $('#microPhone').removeClass('recording');
    $('#microPhone').attr('recording', 'false');
    $('#sendButton').show();
  } else {
    // if it's not recording
    $('#sendButton').hide();
    $('#userInput').prop('disabled', true);
    $('#microPhone').css('padding', '1px');
    $('#microPhone').css('margin-top', '2%');
    $('#microPhone').attr('recording', 'true');
    $('#microPhone').addClass('recording');
    Initialize();
    startRecording();
  }
});
