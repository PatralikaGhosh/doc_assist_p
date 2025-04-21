import os
import sys
import tempfile
import unittest
from io import StringIO
from unittest.mock import patch, MagicMock, mock_open

# Import the functions and objects from your module.
# (Assuming your module is named add_file_to_solr.py)
import add_file_to_solr


class TestAddFileToSolr(unittest.TestCase):

    @patch('add_file_to_solr.boto3.client')
    def test_download_from_s3(self, mock_boto_client):
        # Create a mock S3 client and its download_file method.
        mock_s3 = MagicMock()
        mock_boto_client.return_value = mock_s3

        # Call the function with a sample S3 URI.
        s3_uri = "s3://mybucket/mykey"
        local_path = "/tmp/myfile"
        returned_path = add_file_to_solr.download_from_s3(s3_uri, local_path)
        
        # Check that the S3 client was called and download_file was invoked with correct arguments.
        mock_boto_client.assert_called_once_with('s3')
        mock_s3.download_file.assert_called_once_with("mybucket", "mykey", local_path)
        self.assertEqual(returned_path, local_path)

    @patch('add_file_to_solr.transcribe_audio')
    def test_process_file_audio(self, mock_transcribe_audio):
        # Simulate transcription result.
        mock_transcribe_audio.return_value = "audio transcription"
        # Create a temporary directory to avoid polluting the filesystem.
        with tempfile.TemporaryDirectory() as tmpdirname:
            audio_file = os.path.join(tmpdirname, "test.wav")
            # We don't actually need the file to exist because process_file only reads/writes output.
            output_txt = os.path.join(tmpdirname, "test.txt")
            
            # Change working directory to the temp directory so that output file goes there.
            curdir = os.getcwd()
            os.chdir(tmpdirname)
            try:
                result = add_file_to_solr.process_file(audio_file)
                self.assertEqual(result, "audio transcription")
                # Verify that the output file was created.
                self.assertTrue(os.path.isfile(output_txt))
                with open(output_txt, "r") as f:
                    content = f.read()
                    self.assertEqual(content, "audio transcription")
            finally:
                os.chdir(curdir)

    @patch('add_file_to_solr.extract_audio_from_video')
    @patch('add_file_to_solr.transcribe_audio')
    def test_process_file_video(self, mock_transcribe_audio, mock_extract_audio):
        # Simulate extraction and transcription.
        mock_extract_audio.return_value = "temp_audio.wav"
        mock_transcribe_audio.return_value = "video transcription"
        with tempfile.TemporaryDirectory() as tmpdirname:
            video_file = os.path.join(tmpdirname, "test.mp4")
            output_txt = os.path.join(tmpdirname, "test.txt")
            
            curdir = os.getcwd()
            os.chdir(tmpdirname)
            try:
                result = add_file_to_solr.process_file(video_file)
                self.assertEqual(result, "video transcription")
                self.assertTrue(os.path.isfile(output_txt))
                with open(output_txt, "r") as f:
                    self.assertEqual(f.read(), "video transcription")
            finally:
                os.chdir(curdir)

    @patch('add_file_to_solr.pytesseract.image_to_string')
    @patch('add_file_to_solr.convert_from_path')
    def test_process_file_pdf(self, mock_convert_from_path, mock_image_to_string):
        # Simulate a single-page PDF with OCR result.
        dummy_page = MagicMock()
        mock_convert_from_path.return_value = [dummy_page]
        mock_image_to_string.return_value = "page text "
        with tempfile.TemporaryDirectory() as tmpdirname:
            pdf_file = os.path.join(tmpdirname, "test.pdf")
            output_txt = os.path.join(tmpdirname, "test.txt")
            
            curdir = os.getcwd()
            os.chdir(tmpdirname)
            try:
                result = add_file_to_solr.process_file(pdf_file)
                self.assertEqual(result, "page text ")
                self.assertTrue(os.path.isfile(output_txt))
                with open(output_txt, "r") as f:
                    self.assertEqual(f.read(), "page text ")
            finally:
                os.chdir(curdir)

    def test_process_file_unsupported(self):
        # Provide a file with an unsupported extension.
        dummy_file = "test.doc"
        result = add_file_to_solr.process_file(dummy_file)
        self.assertIsNone(result)

    @patch('add_file_to_solr.sys.exit')
    def test_main_no_args(self, mock_sys_exit):
        # Backup original stdout and sys.argv.
        backup_stdout = sys.stdout
        sys.stdout = StringIO()
        original_argv = sys.argv
        try:
            # Emulate running with no additional arguments.
            sys.argv = ["add_file_to_solr.py"]
            # Call main - expect it to print usage message and exit.
            add_file_to_solr.main()
        finally:
            output = sys.stdout.getvalue()
            sys.stdout = backup_stdout
            sys.argv = original_argv

        self.assertIn("Usage", output)
        mock_sys_exit.assert_called_once_with(1)

    @patch('add_file_to_solr.solr')
    @patch('add_file_to_solr.chunk_text')
    @patch('add_file_to_solr.process_file')
    @patch('add_file_to_solr.download_from_s3')
    def test_main_with_local_file(self, mock_download_from_s3, mock_process_file,
                                  mock_chunk_text, mock_solr):
        # Test main with a local file input.
        # Prepare a dummy content, dummy chunks and override sys.argv.
        dummy_content = "This is some dummy text. It has several sentences. It is used for testing."
        dummy_chunks = [
            "This is some dummy text. It has several sentences. ",
            "It is used for testing."
        ]
        mock_process_file.return_value = dummy_content
        mock_chunk_text.return_value = dummy_chunks
        
        # Backup sys.argv and stdout.
        original_argv = sys.argv
        backup_stdout = sys.stdout
        sys.stdout = StringIO()
        try:
            # Provide a local file (non-S3) argument.
            temp_file = "dummy.pdf"  # The extension doesn't matter here since process_file is mocked.
            sys.argv = ["add_file_to_solr.py", temp_file]
            add_file_to_solr.main()
            output = sys.stdout.getvalue()
        finally:
            sys.stdout = backup_stdout
            sys.argv = original_argv
        
        # Check that no S3 download occurred.
        mock_download_from_s3.assert_not_called()
        # Check that process_file and chunk_text were called.
        mock_process_file.assert_called_once_with(temp_file)
        mock_chunk_text.assert_called_once_with(dummy_content, min_sentences=3, max_sentences=10, threshold=0.2)
        # Verify that solr.add and solr.commit were called.
        self.assertTrue(mock_solr.add.called)
        self.assertTrue(mock_solr.commit.called)
        self.assertIn("Successfully indexed", output)

    @patch('add_file_to_solr.solr')
    @patch('add_file_to_solr.chunk_text')
    @patch('add_file_to_solr.process_file')
    @patch('add_file_to_solr.download_from_s3')
    def test_main_with_s3_uri(self, mock_download_from_s3, mock_process_file,
                              mock_chunk_text, mock_solr):
        # Test main with an S3 URI input.
        dummy_content = "Dummy content from S3 file."
        dummy_chunks = ["Dummy content from S3 file."]
        mock_process_file.return_value = dummy_content
        mock_chunk_text.return_value = dummy_chunks
        
        # Let the download_from_s3 simply return a local path.
        mock_download_from_s3.return_value = "/tmp/dummy.pdf"
        
        original_argv = sys.argv
        backup_stdout = sys.stdout
        sys.stdout = StringIO()
        try:
            s3_uri = "s3://mybucket/dummy.pdf"
            sys.argv = ["add_file_to_solr.py", s3_uri]
            add_file_to_solr.main()
            output = sys.stdout.getvalue()
        finally:
            sys.stdout = backup_stdout
            sys.argv = original_argv
        
        # Ensure that download_from_s3 was called.
        mock_download_from_s3.assert_called_once()
        mock_process_file.assert_called_once_with("/tmp/dummy.pdf")
        self.assertTrue(mock_solr.add.called)
        self.assertTrue(mock_solr.commit.called)
        self.assertIn("Successfully indexed", output)


if __name__ == '__main__':
    unittest.main()
