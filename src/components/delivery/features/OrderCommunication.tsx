
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCustomerCommunication } from '@/hooks/delivery/useCustomerCommunication';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Send, Paperclip, Phone, Upload } from 'lucide-react';
import { format } from 'date-fns';

interface OrderCommunicationProps {
  orderId: string;
  recipientId: string;
  recipientName: string;
  recipientPhone?: string;
}

export const OrderCommunication: React.FC<OrderCommunicationProps> = ({
  orderId,
  recipientId,
  recipientName,
  recipientPhone
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { messages, isConnected, sendMessage, uploadMedia } = useCustomerCommunication(orderId);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id) return;

    setSending(true);
    try {
      const success = await sendMessage(user.id, recipientId, newMessage.trim());
      
      if (success) {
        setNewMessage('');
        toast({
          title: 'Message sent',
          description: 'Your message has been delivered.',
        });
      } else {
        toast({
          title: 'Message failed',
          description: 'Failed to send message. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Message failed',
        description: 'An error occurred while sending the message.',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const handleSendSMS = async () => {
    if (!newMessage.trim() || !user?.id) return;

    setSending(true);
    try {
      const success = await sendMessage(user.id, recipientId, newMessage.trim(), 'sms');
      
      if (success) {
        setNewMessage('');
        toast({
          title: 'SMS sent',
          description: 'Your SMS has been delivered.',
        });
      } else {
        toast({
          title: 'SMS failed',
          description: 'Failed to send SMS. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: 'SMS failed',
        description: 'An error occurred while sending the SMS.',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setUploading(true);
    try {
      toast({
        title: 'Uploading media',
        description: 'Please wait while your file is being uploaded...',
      });

      const mediaUrl = await uploadMedia(file);
      if (mediaUrl) {
        const success = await sendMessage(user.id, recipientId, 'Sent an attachment', 'chat', [mediaUrl]);
        
        if (success) {
          toast({
            title: 'Media uploaded',
            description: 'Your file has been uploaded and sent successfully.',
          });
        } else {
          toast({
            title: 'Upload failed',
            description: 'File uploaded but failed to send message.',
            variant: 'destructive'
          });
        }
      } else {
        toast({
          title: 'Upload failed',
          description: 'Failed to upload the file. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        title: 'Upload failed',
        description: 'An error occurred while uploading the file.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="holographic-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-quantum-cyan" />
            Chat with {recipientName}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="outline" className="bg-green-500/20 text-green-400">
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-500/20 text-red-400">
                Disconnected
              </Badge>
            )}
            {recipientPhone && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(`tel:${recipientPhone}`)}
              >
                <Phone className="h-4 w-4 mr-1" />
                Call
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        <div className="h-64 overflow-y-auto space-y-3 p-3 bg-quantum-darkBlue/20 rounded-lg">
          {messages.length === 0 ? (
            <p className="text-center text-gray-400 text-sm">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    message.sender_id === user?.id
                      ? 'bg-quantum-cyan text-quantum-black'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.media_urls && message.media_urls.length > 0 && (
                    <div className="mt-2">
                      {message.media_urls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt="Attachment"
                          className="max-w-full h-auto rounded"
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-70">
                      {format(new Date(message.created_at), 'HH:mm')}
                    </span>
                    {message.message_type === 'sms' && (
                      <Badge variant="outline" className="text-xs">
                        SMS
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message input */}
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyPress={handleKeyPress}
            disabled={sending || uploading}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            size="icon"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || uploading}
          >
            {uploading ? (
              <Upload className="h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending || uploading}
          >
            <Send className="h-4 w-4" />
          </Button>
          {recipientPhone && (
            <Button
              variant="outline"
              onClick={handleSendSMS}
              disabled={!newMessage.trim() || sending || uploading}
            >
              SMS
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
