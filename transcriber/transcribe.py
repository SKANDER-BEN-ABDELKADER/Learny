import argparse
import whisper
import sys


def main():
    parser = argparse.ArgumentParser(description="Transcribe audio using OpenAI Whisper.")
    parser.add_argument("audio_path", type=str, help="Path to the audio file (mp3, wav, etc.)")
    parser.add_argument("--model", type=str, default="base", choices=["tiny", "base", "small", "medium", "large"], help="Model size to use (default: base)")
    args = parser.parse_args()

    print(f"Loading Whisper model: {args.model} ...")
    model = whisper.load_model(args.model)

    print(f"Transcribing file: {args.audio_path} ...")
    result = model.transcribe(args.audio_path)

    print("\n--- Transcription Result ---\n")
    print(result["text"])

if __name__ == "__main__":
    main()