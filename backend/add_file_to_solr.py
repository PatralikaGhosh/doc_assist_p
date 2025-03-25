import pysolr
import os
import sys
from transcribe_audio import transcribe_audio, extract_audio_from_video
from nltk_chunking import chunk_text
from pdf2image import convert_from_path
import pytesseract

# pip install pytesseract, pip install pdf2image, brew install poppler
# Sample usage: python3 add_pdf_to_solr.py "file1.pdf" "file2.pdf"

solr_url = 'http://localhost:8983/solr/document_processing'
solr = pysolr.Solr(solr_url)

# Check if at least one file was provided
if len(sys.argv) < 2:
    print("Usage: python3 add_pdf_to_solr.py <file1.pdf> [<file2.pdf> ...]")
    sys.exit(1)

all_docs = []

for file_path in sys.argv[1:]:
    filename, ext = os.path.splitext(file_path)
    ext = ext.lower()
    audio_extensions = {'.wav', '.mp3', '.m4a', '.ogg', '.flac'}
    video_extensions = {'.mp4', '.mov', '.avi', '.mkv', '.flv', '.wmv'}

    if ext in audio_extensions:
        # Open a new file (or overwrite if it exists) and write content
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
        # Write the extracted text to a new text file
        output_file = filename + ".txt"
        with open(output_file, "w") as f:
            f.write(content)
        print(f"Extracted text written to {output_file}")
        
    else:
        print(f"Unsupported file type: {file_path}")
    
    with open(filename + ".txt", "r") as f:
        content = f.read()

    # Split text into chunks for Solr indexing
    chunks = chunk_text(content, min_sentences=3, max_sentences=10, threshold=0.2)
    
    # Build documents for each chunk
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
    print(f"Successfully indexed {len(all_docs)} chunks from {len(sys.argv) - 1} files.")
else:
    print("No content found to index.")
