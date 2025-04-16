import sys
import os
import whisper
from moviepy.editor import VideoFileClip
from deepmultilingualpunctuation import PunctuationModel


def extract_audio_from_video(video_path):
    """
    Extract the audio track from a video file and save it as a WAV file.
    """
    base = os.path.splitext(os.path.basename(video_path))[0]
    audio_output = "temp_" + base + ".wav"
    video_clip = VideoFileClip(video_path)
    audio_clip = video_clip.audio
    audio_clip.write_audiofile(audio_output)
    audio_clip.close()
    video_clip.close()
    return audio_output

def transcribe_audio(audio_path, model_size="base"):
    """
    Transcribe an audio file using OpenAI's Whisper model.
    Possible model sizes: tiny, base, small, medium, large
    """
    model = whisper.load_model(model_size)
    result = model.transcribe(audio_path)
    model = PunctuationModel()
    text = result["text"]
    punct_result = model.restore_punctuation(text)
    return punct_result