import React, { useState } from 'react';
import { Box, Typography, Button, List, ListItem, ListItemText, Alert, CircularProgress } from '@mui/material';

const IngestMsgFilesPage = () => {
  const [files, setFiles] = useState([]);
  const [folderName, setFolderName] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFolderSelect = (event) => {
    const selectedFiles = Array.from(event.target.files).filter(file => file.name.endsWith('.msg'));
    setFiles(selectedFiles);
    setResults([]);
    setError('');

    if (selectedFiles.length > 0) {
      const firstPath = selectedFiles[0].webkitRelativePath;
      const folderHierarchy = firstPath.split('/').slice(0, -1).join('/');
      setFolderName(folderHierarchy);
    } else {
      setFolderName('');
    }
  };

  const handleIngest = async () => {
    setLoading(true);
    setError('');
    setResults([]);
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('http://localhost:9000/api/ingest-msg-dir', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          throw new Error('Failed to upload ' + file.name);
        }
        const data = await response.json();
        setResults(prev => {
          const updated = [...prev, { file: file.name, status: 'success', issue_id: data.issue_id }];
          console.log('Updated results (success):', updated);
          return updated;
        });
      } catch (err) {
        setResults(prev => {
          const updated = [...prev, { file: file.name, status: 'error', error: err.message }];
          console.log('Updated results (error):', updated);
          return updated;
        });
      }
    }
    setLoading(false);
  };

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" gutterBottom>
          Ingest MSG Files from Folder
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button variant="contained" component="label">
            Select Folder
            <input
              type="file"
              webkitdirectory="true"
              directory=""
              multiple
              hidden
              onChange={handleFolderSelect}
            />
          </Button>

          <Button variant="contained" onClick={handleIngest} disabled={loading || files.length === 0}>
            {loading ? <CircularProgress size={24} /> : 'Ingest'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

      </Box>

      {files.length > 0 && (
        <Box sx={{ width: 300, maxHeight: 400, overflowY: 'auto', border: '1px solid #ccc', p: 1 }}>
          <Typography variant="subtitle1">Selected Files ({files.length}):</Typography>
          <List dense>
            {files.map((file, index) => (
              <ListItem key={index}>
                <ListItemText primary={file.name} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}


      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {results.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Ingestion Results:</Typography>
          <List>
            {results.map((result, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={result.file}
                  secondary={
                    result.status === 'success'
                      ? `Success - Issue ID: ${result.issue_id}`
                      : `Error: ${result.error}`
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default IngestMsgFilesPage;