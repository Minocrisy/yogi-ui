import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { useElevenLabs } from '../context/ElevenLabsContext';
import { HistoryItem } from '../types/elevenlabs';

const HistoryManager = () => {
  const { getHistory, downloadHistoryItem, deleteHistoryItems } = useElevenLabs();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadHistory = async () => {
    try {
      const response = await getHistory(rowsPerPage, page > 0 ? history[history.length - 1].history_item_id : undefined);
      setHistory(response.history);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handlePlay = async (historyItemId: string) => {
    try {
      const audioBlob = await downloadHistoryItem(historyItemId);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      if (playingAudio === historyItemId) {
        setPlayingAudio(null);
        audio.pause();
      } else {
        setPlayingAudio(historyItemId);
        audio.play();
        audio.onended = () => setPlayingAudio(null);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleDownload = async (historyItemId: string) => {
    try {
      const audioBlob = await downloadHistoryItem(historyItemId);
      const url = window.URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generation-${historyItemId}.mp3`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading audio:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteHistoryItems(selectedItems);
      setSelectedItems([]);
      loadHistory();
      setConfirmDelete(false);
    } catch (error) {
      console.error('Error deleting items:', error);
    }
  };

  const formatDate = (unixTimestamp: number) => {
    return new Date(unixTimestamp * 1000).toLocaleString();
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Generation History</Typography>
        {selectedItems.length > 0 && (
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setConfirmDelete(true)}
          >
            Delete Selected ({selectedItems.length})
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Voice</TableCell>
              <TableCell>Text</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((item) => (
              <TableRow key={item.history_item_id}>
                <TableCell>{formatDate(item.date_unix)}</TableCell>
                <TableCell>{item.voice_name}</TableCell>
                <TableCell>{item.text.substring(0, 50)}...</TableCell>
                <TableCell>
                  <Chip
                    label={item.state}
                    color={item.state === 'completed' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handlePlay(item.history_item_id)}
                    disabled={item.state !== 'completed'}
                  >
                    <PlayArrowIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDownload(item.history_item_id)}
                    disabled={item.state !== 'completed'}
                  >
                    <DownloadIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={-1}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {selectedItems.length} selected items?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HistoryManager;
