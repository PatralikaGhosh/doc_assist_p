import os
import sys
import pysolr
import boto3  # New: for S3 operations
import urllib.parse

from transcribe_audio import transcribe_audio, extract_audio_from_video
from nltk_chunking import chunk_text
from pdf2image import convert_from_path
import pytesseract

# Set your Solr URL. 
# If deployed in ECS with service discovery, you might use 'solr', 
# or use a load balancer DNS name if exposed externally.
solr_url = 'http://solr.solr.internal:8983/solr/document_processing'
solr = pysolr.Solr(solr_url)

def download_from_s3(s3_uri, local_path):
    """
    Downloads a file from S3 to local_path.
    Expects s3_uri in the format: s3://bucket/key
    """
    parsed = urllib.parse.urlparse(s3_uri)
    bucket = parsed.netloc
    key = parsed.path.lstrip('/')  # Remove leading slash
    s3 = boto3.client('s3')
    print(f"Downloading from S3 bucket: {bucket}, key: {key} to {local_path}")
    s3.download_file(bucket, key, local_path)
    return local_path

def process_file(file_path):
    """
    Process a single file (audio, video, or PDF) and return the text content.
    """
    filename, ext = os.path.splitext(file_path)
    ext = ext.lower()
    audio_extensions = {'.wav', '.mp3', '.m4a', '.ogg', '.flac'}
    video_extensions = {'.mp4', '.mov', '.avi', '.mkv', '.flv', '.wmv'}

    if ext in audio_extensions:
        print(f"Transcribing audio file: {file_path}")
        transcription = transcribe_audio(file_path)
        output_file = filename + ".txt"
        with open(output_file, "w") as f:
            f.write(transcription)
        print(f"Transcription written to {output_file}")
    elif ext in video_extensions:
        print(f"Extracting audio from video file: {file_path}")
        audio_temp = extract_audio_from_video(file_path)
        transcription = transcribe_audio(audio_temp)
        output_file = filename + ".txt"
        with open(output_file, "w") as f:
            f.write(transcription)
        print(f"Transcription written to {output_file}")
    elif ext == '.pdf':
        print(f"Extracting text from PDF file: {file_path}")
        pages = convert_from_path(file_path)
        content = ""
        for page in pages:
            page_text = pytesseract.image_to_string(page)
            content += page_text
        output_file = filename + ".txt"
        with open(output_file, "w") as f:
            f.write(content)
        print(f"Extracted text written to {output_file}")
    else:
        print(f"Unsupported file type: {file_path}")
        return None

    # Read the generated text file and return its content.
    with open(filename + ".txt", "r") as f:
        return f.read()

def main():
    # Expect at least one argument: either a local file path or an S3 URI.
    if len(sys.argv) < 2:
        print("Usage: python3 add_file_to_solr.py <file1.pdf or s3://bucket/key> [<file2> ...]")
        sys.exit(1)
    
    all_docs = []

    for input_path in sys.argv[1:]:
        # If the input path starts with "s3://", download the file from S3 first.
        if input_path.startswith("s3://"):
            local_temp = os.path.join("/tmp", os.path.basename(input_path))
            input_path = download_from_s3(input_path, local_temp)
        
        content = process_file(input_path)
        if content is None:
            continue
        
        # Split text into chunks for Solr indexing
        chunks = chunk_text(content, min_sentences=3, max_sentences=10, threshold=0.2)
        
        # Build documents for each chunk
        filename, _ = os.path.splitext(os.path.basename(input_path))
        for i, para in enumerate(chunks, start=1):
            doc_id = f"{filename}-{i}"
            all_docs.append({
                'id': doc_id,
                'filename': filename,
                'content': para,
            })
    
    # Send all documents to Solr
    if all_docs:
        solr.add(all_docs)
        solr.commit()
        print(f"Successfully indexed {len(all_docs)} chunks from {len(sys.argv) - 1} file(s).")
    else:
        print("No content found to index.")

if __name__ == "__main__":
    main()
