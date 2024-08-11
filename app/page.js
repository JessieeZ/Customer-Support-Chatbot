'use client';

import { Box, Stack, TextField, Typography, IconButton, Avatar, Button, Rating } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import './i18n'; 

// Styled component for the chat header
const Header = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1E88E5, #64B5F6)', 
  color: '#FFFFFF', // Text color
  borderRadius: '16px 16px 0 0', // Rounded corners
  textAlign: 'center', // Centered text
  padding: theme.spacing(2), // Padding
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Shadow effect
  position: 'relative', // Relative positioning for zIndex
  zIndex: 1, // Layering order
}));

// Styled component for the chat message bubbles
const MessageBubble = styled(Box)(({ role }) => ({
  backgroundColor: role === 'assistant' ? '#1E88E5' : '#42A5F5', // Different colors based on role
  color: '#FFFFFF', 
  borderRadius: '16px', // Rounded corners
  padding: '16px', 
  paddingBottom: '30px', 
  maxWidth: '75%', 
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', 
  wordBreak: 'break-word', 
  lineHeight: '1.4', 
  fontSize: '14px', 
  position: 'relative', 
  display: 'flex', 
  alignItems: 'center', 
}));

// Styled component for the message timestamp
const Timestamp = styled(Typography)(({ theme }) => ({
  fontSize: '12px', 
  color: '#B0BEC5', 
  position: 'absolute', 
  bottom: '-20px', 
  right: '8px', 
  marginTop: '4px', 
}));

// Component to display typing indicator
const TypingIndicator = ({ t }) => (
  <Box display="flex" justifyContent="center" alignItems="center" p={2}>
    <Typography variant="body2" color="textSecondary">
      {t('typing')} {/* Text*/}
    </Typography>
  </Box>
);

// Function to get the current time in HH:MM format
const getCurrentTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Main component for the chat application
export default function Home() {
  const { t, i18n } = useTranslation(); // Hook for translations
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t('greeting'), // Initial greeting message
      timestamp: getCurrentTime(), 
    },
  ]);

  const [message, setMessage] = useState(''); // Current user input
  const [isLoading, setIsLoading] = useState(false); // Loading state for API requests
  const [isAssistantTyping, setIsAssistantTyping] = useState(false); // Assistant typing indicator

  // Feedback form states
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false); 
  const [feedbackRating, setFeedbackRating] = useState(0); 
  const [feedbackComment, setFeedbackComment] = useState(''); 

  // Function to send a message
  const sendMessage = async () => {
    if (!message.trim() || isLoading) return; // Prevent sending empty messages or if already loading
    setIsLoading(true);

    // Create new messages for user and assistant
    const newUserMessage = { role: 'user', content: message, timestamp: getCurrentTime() };
    const newAssistantMessage = { role: 'assistant', content: '. . .', timestamp: getCurrentTime() };

    // Update messages state
    setMessages(prevMessages => [
      ...prevMessages,
      newUserMessage,
      newAssistantMessage,
    ]);

    setIsAssistantTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, newUserMessage]),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok'); // Handle network errors
      }

      // Process streamed response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let updatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        updatedContent += decoder.decode(value, { stream: true });

        // Update the latest assistant message with the streamed content
        setMessages(prevMessages => {
          const lastMessageIndex = prevMessages.length - 1;
          const updatedMessages = [...prevMessages];
          updatedMessages[lastMessageIndex] = {
            ...updatedMessages[lastMessageIndex],
            content: updatedContent,
          };
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: t('error'), timestamp: getCurrentTime() },
      ]);
    }

    setIsAssistantTyping(false);
    setIsLoading(false);
    setMessage(''); // Clear message input
  };

  // Function to handle keypress event for sending messages
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent newline on Enter key
      sendMessage(); 
    }
  };

  const messagesEndRef = useRef(null); 

  // Function to scroll to the bottom of the message list
  const scrollToBottom = () => {
    const element = messagesEndRef.current;
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom(); // Scroll to bottom when messages change
  }, [messages]);

  // Function to change the language
  const handleLanguageChange = async (lng) => {
    await i18n.changeLanguage(lng);

    // Send a new greeting message in the selected language
    const newGreetingMessage = { role: 'assistant', content: t('greeting'), timestamp: getCurrentTime() };
    setMessages(prevMessages => [
      ...prevMessages,
      newGreetingMessage,
    ]);
  };

  // Function to show the feedback form
  const endChat = () => {
    setIsFeedbackVisible(true);
  };

  // Function to submit feedback
  const submitFeedback = async () => {
    try {
      const feedbackData = {
        rating: feedbackRating,
        comment: feedbackComment,
        timestamp: getCurrentTime(),
      };

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        throw new Error('Feedback submission failed');
      }

      // Clear feedback form and hide it
      setFeedbackRating(0);
      setFeedbackComment('');
      setIsFeedbackVisible(false);
      alert(t('thankYouForFeedback')); 
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert(t('errorSubmittingFeedback')); 
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        background: 'linear-gradient(135deg, #2196F3, #64B5F6)', 
        p: 2,
        position: 'relative',
      }}
    >
      <Stack
        direction={'column'}
        width="600px"
        height="80vh"
        borderRadius={16}
        border="1px solid #B3E5F7"
        boxShadow="0 8px 16px rgba(0, 0, 0, 0.15)"
        p={4}
        spacing={2}
        sx={{
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Header */}
        <Header>
          <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: 0.5 }}>
            {t('chatbotTitle')} {/* */}
          </Typography>
        </Header>
        
        <Stack
          direction={'column'}
          spacing={4}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
          p={2}
          sx={{
            backgroundColor: '#F0F8FF',
            borderRadius: 1,
            boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.1)',
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={msg.role === 'assistant' ? 'flex-start' : 'flex-end'}
              position="relative"
            >
              <Stack direction="row" spacing={1} alignItems="flex-end">
                {msg.role === 'assistant' ? (
                  <>
                    <Avatar>
                      <SmartToyIcon /> {/* Icon for the bot */}
                    </Avatar>
                    <MessageBubble role={msg.role}>
                      <Typography variant="body2">{msg.content}</Typography>
                      <Timestamp variant="caption">{msg.timestamp}</Timestamp>
                    </MessageBubble>
                  </>
                ) : (
                  <>
                    <MessageBubble role={msg.role}>
                      <Typography variant="body2">{msg.content}</Typography>
                      <Timestamp variant="caption">{msg.timestamp}</Timestamp>
                    </MessageBubble>
                    <Avatar>
                      <PersonIcon /> {/* Icon for the user */}
                    </Avatar>
                  </>
                )}
              </Stack>
            </Box>
          ))}
          {isAssistantTyping && <TypingIndicator t={t} />} {/* Typing indicator */}
          <div ref={messagesEndRef} aria-live="polite" />
        </Stack>

        {/* Language Switcher */}
        <Stack direction="row" spacing={5} sx={{ mb: 2 }}>
          <Button onClick={() => handleLanguageChange('en')}>English</Button>
          <Button onClick={() => handleLanguageChange('es')}>Español</Button>
          <Button onClick={() => handleLanguageChange('ch')}>中文</Button>
          <Button onClick={() => handleLanguageChange('fr')}>Français</Button>
          <Button onClick={() => handleLanguageChange('hi')}>हिन्दी</Button>
        </Stack>

        {/* Text Input and Send Button */}
        <Stack direction={'row'} spacing={2} sx={{ mt: 2 }}>
          <TextField
            label={t('typeMessage')} 
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)} 
            onKeyPress={handleKeyPress} 
            disabled={isLoading} 
            variant="outlined"
            size="small"
            sx={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
              '& .MuiOutlinedInput-root': {
                borderRadius: 12,
              },
              '& .MuiInputLabel-root': {
                color: '#90CAF9',
              },
              '& .MuiOutlinedInput-input': {
                padding: '10px 14px',
              },
            }}
          />
          <IconButton 
            onClick={sendMessage}
            disabled={isLoading || !message.trim()} 
            size="large"
            sx={{
              borderRadius: 12,
              backgroundColor: '#1E88E5',
              color: '#FFFFFF',
              '&:hover': {
                backgroundColor: '#1565C0',
              },
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              padding: '12px',
            }}
          >
            <SendIcon /> {/* Send button icon */}
          </IconButton>
        </Stack>
      </Stack>

      {/* End Chat Button */}
      <Button 
        onClick={endChat} 
        variant="contained" 
        color="primary" 
        sx={{ 
          position: 'absolute',
          bottom: 16,
          right: 16,
          padding: '6px 12px',
          fontSize: '0.875rem',
          borderRadius: '8px',
        }}
      >
        {t('Give Feedback')} {/* Button text */}
      </Button>

      {/* Feedback Form */}
      {isFeedbackVisible && (
        <Box
          p={4}
          sx={{
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            backgroundColor: '#FAFAFA',
            position: 'absolute',
            bottom: '16px',
            width: 'calc(100% - 32px)',
            maxWidth: '600px',
            textAlign: 'center',
            left: '16px',
            zIndex: 10,
            border: '1px solid #E0E0E0',
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold', color: '#333333' }}>
            {t('Please rate the chat!')} {/* Feedback form title */}
          </Typography>
          <Stack spacing={2} alignItems="center">
            <Rating
              value={feedbackRating}
              onChange={(event, newValue) => setFeedbackRating(newValue)} 
              precision={0.5}
              size="large"
              sx={{ mb: 2, color: '#FFC107' }}
            />
            <TextField
              label={t('Leave your feedback here!')} 
              multiline
              rows={4}
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              variant="outlined"
              sx={{
                mb: 2,
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                },
                '& .MuiInputLabel-root': {
                  color: '#333333',
                },
                '& .MuiOutlinedInput-input': {
                  padding: '12px',
                },
              }}
            />
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                onClick={submitFeedback} 
                variant="contained"
                color="primary"
                size="large"
                sx={{
                  borderRadius: '8px',
                  padding: '10px 20px',
                  backgroundColor: '#1E88E5',
                  '&:hover': {
                    backgroundColor: '#1565C0',
                  },
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                }}
              >
                {t('submit')} {/* Submit button */}
              </Button>
              <Button
                onClick={() => setIsFeedbackVisible(false)} 
                variant="outlined"
                color="secondary"
                size="large"
                sx={{
                  borderRadius: '8px',
                  padding: '10px 20px',
                  borderColor: '#E0E0E0',
                  '&:hover': {
                    borderColor: '#B0BEC5',
                  },
                  color: '#555555',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                {t('cancel')} {/* Cancel button */}
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}
    </Box>
  );
}
