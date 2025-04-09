import React, { useState, useRef, useEffect } from "react";
import { Smile, Paperclip, Mic, Send, X, Play, Square } from "lucide-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MessageInputProps {
  onSendMessage: (message: string, attachments?: File[]) => void;
  replyTo?: {
    id: string;
    text: string;
    sender: string;
  } | null;
  onCancelReply: () => void;
}

// Interface for attachment items with a unique ID
interface AttachmentItem {
  id: string;
  file: File;
  previewUrl: string;
  fileName?: string;
  fileType?: string;
  audioUrl?: string; // URL for audio playback if it's an audio file
  isPlaying?: boolean; // Track playing status for each audio attachment
}

export function MessageInput({
  onSendMessage,
  replyTo,
  onCancelReply,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [attachmentItems, setAttachmentItems] = useState<AttachmentItem[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachmentLimitWarning, setShowAttachmentLimitWarning] =
    useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Maximum number of attachments allowed
  const MAX_ATTACHMENTS = 10;

  // Function to adjust textarea height automatically
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";

      // Calculate new height (capped at 150px for scrolling)
      const newHeight = Math.min(textarea.scrollHeight, 150);
      textarea.style.height = `${newHeight}px`;
    }
  };

  useEffect(() => {
    // Focus textarea when component mounts or when reply changes
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);

  // Adjust height whenever message content changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  useEffect(() => {
    // Clean up preview URLs when component unmounts
    return () => {
      attachmentItems.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.audioUrl) URL.revokeObjectURL(item.audioUrl);
      });
    };
  }, [attachmentItems]);

  // Close emoji picker on scroll
  useEffect(() => {
    if (isEmojiPickerOpen) {
      const handleScrollOrWheel = () => {
        setIsEmojiPickerOpen(false);
      };

      // Listen for both scroll and wheel events
      window.addEventListener("scroll", handleScrollOrWheel, true);
      window.addEventListener("wheel", handleScrollOrWheel, true);

      // Clean up event listeners
      return () => {
        window.removeEventListener("scroll", handleScrollOrWheel, true);
        window.removeEventListener("wheel", handleScrollOrWheel, true);
      };
    }
  }, [isEmojiPickerOpen]);

  const handleSendMessage = () => {
    if (message.trim() || attachmentItems.length > 0) {
      const files = attachmentItems.map((item) => item.file);
      onSendMessage(message, files);
      setMessage("");

      // Clear attachments and revoke object URLs to prevent memory leaks
      attachmentItems.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
        if (item.audioUrl) URL.revokeObjectURL(item.audioUrl);

        // Stop any playing audio
        const audioElement = audioElementsRef.current.get(item.id);
        if (audioElement) {
          audioElement.pause();
          audioElement.currentTime = 0;
          audioElementsRef.current.delete(item.id);
        }
      });

      setAttachmentItems([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === "Enter" && e.ctrlKey) {
      // Insert a newline with Ctrl+Enter
      setMessage((prev) => prev + "\n");
      e.preventDefault();

      // Defer height adjustment to next tick after state update
      setTimeout(adjustTextareaHeight, 0);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Determines if a file is an image based on MIME type and extension
   */
  const isImageFile = (file: File): boolean => {
    // Check MIME type first
    if (file.type.startsWith("image/")) {
      return true;
    }

    // Then check file extension
    const fileExtensionMatch = /\.([a-z0-9]+)$/i.exec(file.name);
    if (fileExtensionMatch) {
      const extension = fileExtensionMatch[1].toLowerCase();
      return [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "bmp",
        "webp",
        "svg",
        "tiff",
        "jfif",
        "avif",
      ].includes(extension);
    }

    return false;
  };

  /**
   * Determines if a file is an audio file based on MIME type
   */
  const isAudioFile = (file: File): boolean => {
    return (
      file.type.startsWith("audio/") ||
      file.name.toLowerCase().endsWith(".webm") ||
      file.name.toLowerCase().endsWith(".mp3") ||
      file.name.toLowerCase().endsWith(".wav") ||
      file.name.toLowerCase().endsWith(".ogg")
    );
  };

  // Generate a unique ID for attachments
  const generateUniqueId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Force creation of object URL for an image file
  const createImagePreview = (file: File): string => {
    try {
      // Always create an object URL for image files
      return URL.createObjectURL(file);
    } catch (error) {
      console.error("Failed to create preview URL for:", file.name, error);
      return "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);

      // Check if adding these files would exceed the limit
      if (attachmentItems.length + newFiles.length > MAX_ATTACHMENTS) {
        // Show warning message
        setShowAttachmentLimitWarning(true);

        // Auto-hide warning after 3 seconds
        setTimeout(() => setShowAttachmentLimitWarning(false), 3000);

        // Only add files up to the limit
        const filesToAdd = newFiles.slice(
          0,
          MAX_ATTACHMENTS - attachmentItems.length
        );

        if (filesToAdd.length === 0) {
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          return;
        }

        // Process each file with proper file type detection and preview creation
        const newItems = filesToAdd.map(processFileForAttachment);
        setAttachmentItems((prev) => [...prev, ...newItems]);
      } else {
        // Add all files with proper processing
        const newItems = newFiles.map(processFileForAttachment);
        setAttachmentItems((prev) => [...prev, ...newItems]);
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Helper function to process a file for attachment
  const processFileForAttachment = (file: File): AttachmentItem => {
    // Default empty preview
    let previewUrl = "";
    let audioUrl = "";
    const id = generateUniqueId();

    // Try to create preview URL for image files
    if (isImageFile(file)) {
      try {
        previewUrl = URL.createObjectURL(file);
        console.log(`Created preview for ${file.name}: ${previewUrl}`);
      } catch (err) {
        console.error(`Failed to create preview for ${file.name}`, err);
      }
    }

    // If it's an audio file, create an audio URL
    if (isAudioFile(file)) {
      try {
        audioUrl = URL.createObjectURL(file);
        console.log(`Created audio URL for ${file.name}: ${audioUrl}`);

        // Create and set up audio element for this file
        const audioElement = new Audio(audioUrl);
        audioElement.addEventListener("ended", () => {
          // Update isPlaying status when audio ends
          setAttachmentItems((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, isPlaying: false } : item
            )
          );
        });

        // Store the audio element reference
        audioElementsRef.current.set(id, audioElement);
      } catch (err) {
        console.error(`Failed to create audio URL for ${file.name}`, err);
      }
    }

    return {
      id,
      file,
      previewUrl,
      audioUrl,
      fileName: file.name, // Store filename explicitly to avoid issues
      fileType: file.type || getFileTypeFromName(file.name), // Ensure we have a file type
      isPlaying: false,
    };
  };

  // Get file type from name when MIME type is missing
  const getFileTypeFromName = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    const imageExtensions = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "webp",
      "svg",
      "tiff",
      "jfif",
    ];

    const audioExtensions = ["mp3", "wav", "ogg", "webm"];

    if (imageExtensions.includes(extension)) {
      return `image/${extension === "jpg" ? "jpeg" : extension}`;
    }

    if (audioExtensions.includes(extension)) {
      return `audio/${extension}`;
    }

    return `application/${extension}`;
  };

  const removeAttachment = (id: string) => {
    setAttachmentItems((prev) => {
      // Find the item by ID instead of index
      const itemToRemove = prev.find((item) => item.id === id);

      // Revoke object URL if it exists
      if (itemToRemove?.previewUrl) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      }

      // If it's an audio attachment, stop playback and clean up
      if (itemToRemove?.audioUrl) {
        URL.revokeObjectURL(itemToRemove.audioUrl);

        const audioElement = audioElementsRef.current.get(id);
        if (audioElement) {
          audioElement.pause();
          audioElement.currentTime = 0;
          audioElementsRef.current.delete(id);
        }
      }

      // Remove the item by filtering
      return prev.filter((item) => item.id !== id);
    });
  };

  const startRecording = async () => {
    try {
      // Check if adding an audio file would exceed the limit
      if (attachmentItems.length >= MAX_ATTACHMENTS) {
        setShowAttachmentLimitWarning(true);
        setTimeout(() => setShowAttachmentLimitWarning(false), 3000);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        // Create an object URL for the audio blob for preview playback
        const audioFile = new File([audioBlob], "voice-message.webm", {
          type: "audio/webm",
        });

        const id = generateUniqueId();
        const audioUrl = URL.createObjectURL(audioBlob);

        // Create and set up audio element for this recording
        const audioElement = new Audio(audioUrl);
        audioElement.addEventListener("ended", () => {
          // Update isPlaying status when audio ends
          setAttachmentItems((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, isPlaying: false } : item
            )
          );
        });

        // Store the audio element reference
        audioElementsRef.current.set(id, audioElement);

        // Add to attachments
        setAttachmentItems((prev) => [
          ...prev,
          {
            id,
            file: audioFile,
            previewUrl: "",
            audioUrl,
            fileName: "Voice Message",
            fileType: "audio/webm",
            isPlaying: false,
          },
        ]);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const togglePlayAudio = (id: string) => {
    // Get the audio element for this attachment
    const audioElement = audioElementsRef.current.get(id);
    if (!audioElement) return;

    // Find if this attachment is currently playing
    const attachment = attachmentItems.find((item) => item.id === id);
    if (!attachment) return;

    // First, pause all currently playing audio
    attachmentItems.forEach((item) => {
      if (item.id !== id && item.isPlaying) {
        const otherAudio = audioElementsRef.current.get(item.id);
        if (otherAudio) {
          otherAudio.pause();
        }
      }
    });

    // Then update all playing states
    setAttachmentItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          // Toggle the current item
          return { ...item, isPlaying: !item.isPlaying };
        } else if (item.isPlaying) {
          // Pause any other playing items
          return { ...item, isPlaying: false };
        }
        return item;
      })
    );

    // Finally, play or pause the current audio
    if (attachment.isPlaying) {
      audioElement.pause();
    } else {
      // Reset other audio elements
      audioElementsRef.current.forEach((audio, audioId) => {
        if (audioId !== id) {
          audio.pause();
          audio.currentTime = 0;
        }
      });

      // Play this audio
      audioElement.currentTime = 0; // Start from beginning
      audioElement.play().catch((err) => {
        console.error("Error playing audio:", err);
        // Reset playing state if there's an error
        setAttachmentItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, isPlaying: false } : item
          )
        );
      });
    }
  };

  const insertEmoji = (emoji: any) => {
    setMessage((prev) => prev + emoji.native);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Cleanup audio URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up all audio elements
      audioElementsRef.current.forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
      audioElementsRef.current.clear();
    };
  }, []);

  return (
    <div className="p-4 border-t">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />

      {/* Attachment limit warning */}
      {showAttachmentLimitWarning && (
        <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm p-2 rounded-md mb-2 animate-fade-in flex items-center justify-between">
          <span>
            Maximum {MAX_ATTACHMENTS} files can be attached to a message.
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAttachmentLimitWarning(false)}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {replyTo && (
        <div className="flex items-center bg-muted/30 p-2 rounded-md mb-2 text-sm animate-fade-in">
          <div className="flex-shrink-0 mr-2 text-muted-foreground">
            Replying to {replyTo.sender}
          </div>
          <span className="truncate flex-1">{replyTo.text}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancelReply}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {attachmentItems.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 animate-fade-in">
          <div className="w-full flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">
              {attachmentItems.length} of {MAX_ATTACHMENTS} files attached
            </span>
            {attachmentItems.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Clean up audio elements
                  audioElementsRef.current.forEach((audio) => {
                    audio.pause();
                    audio.src = "";
                  });
                  audioElementsRef.current.clear();

                  // Clear all attachments
                  attachmentItems.forEach((item) => {
                    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
                    if (item.audioUrl) URL.revokeObjectURL(item.audioUrl);
                  });

                  setAttachmentItems([]);
                }}
                className="h-7 px-2 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
          {attachmentItems.map((item) => (
            <div key={item.id} className="relative group">
              {item.previewUrl && isImageFile(item.file) ? (
                <div className="relative h-20 w-20 rounded-md overflow-hidden border">
                  <img
                    src={item.previewUrl}
                    alt={item.fileName || item.file.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      console.error(
                        `Failed to load image preview for ${
                          item.fileName || item.file.name
                        }`
                      );
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <button
                    onClick={() => removeAttachment(item.id)}
                    className="absolute top-0 right-0 bg-black/70 text-white rounded-bl-md p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : item.fileType?.startsWith("audio/") ? (
                <div className="flex items-center p-2 border rounded-md bg-muted/20 group-hover:bg-muted/30 transition-colors">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 mr-2"
                    onClick={() => togglePlayAudio(item.id)}
                  >
                    {item.isPlaying ? (
                      <Square className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <span className="text-sm truncate max-w-[140px]">
                    {item.fileName === "Voice Message"
                      ? "Voice Message"
                      : item.fileName || item.file.name || "Audio File"}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 ml-1 p-0"
                    onClick={() => removeAttachment(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center p-2 border rounded-md bg-muted/20 group-hover:bg-muted/30 transition-colors min-w-[180px]">
                  <span className="text-sm truncate flex-1">
                    {item.fileName || item.file.name || "Unknown file"}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 ml-1 p-0"
                    onClick={() => removeAttachment(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bottom toolbar and input area */}
      <div className="relative">
        {/* Emoji and attachment buttons positioned above the input for better experience */}
        <div className="flex items-center gap-2 mb-2">
          <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-full p-0 border-muted/30 bg-gray-900"
              align="start"
              side="top"
              onEscapeKeyDown={() => setIsEmojiPickerOpen(false)}
              onInteractOutside={() => setIsEmojiPickerOpen(false)}
            >
              <div className="h-[350px]">
                <Picker
                  data={data}
                  onEmojiSelect={(emoji) => {
                    insertEmoji(emoji);
                    setIsEmojiPickerOpen(false);
                  }}
                  theme="dark"
                  set="native"
                />
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            onClick={triggerFileInput}
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
            disabled={attachmentItems.length >= MAX_ATTACHMENTS}
            title={
              attachmentItems.length >= MAX_ATTACHMENTS
                ? `Maximum ${MAX_ATTACHMENTS} attachments allowed`
                : "Attach files"
            }
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleRecording}
            className={
              isRecording
                ? "h-9 w-9 rounded-full bg-red-500 text-white hover:bg-red-600"
                : "h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }
            disabled={!isRecording && attachmentItems.length >= MAX_ATTACHMENTS}
            title={
              !isRecording && attachmentItems.length >= MAX_ATTACHMENTS
                ? `Maximum ${MAX_ATTACHMENTS} attachments allowed`
                : isRecording
                ? "Stop recording"
                : "Record voice message"
            }
          >
            <Mic className="h-5 w-5" />
          </Button>

          {message.length > 0 && (
            <div className="ml-auto text-xs text-gray-500">
              {message.length}{" "}
              {message.length === 1 ? "character" : "characters"}
              {message.length > 500 && message.length <= 1000 && (
                <span className="ml-1 text-amber-500"> (getting long)</span>
              )}
              {message.length > 1000 && (
                <span className="ml-1 text-red-500"> (very long)</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-16 min-h-[24px] max-h-[150px] overflow-y-auto py-3 bg-gray-200 dark:bg-gray-800/60 rounded-2xl border-muted/30 focus-visible:ring-0 focus-visible:border-purple-600/50 custom-scrollbar"
              style={{
                resize: "none",
                transition: "height 0.1s ease",
              }}
            />

            {/* Character count positioned inside the textarea for space efficiency */}
            {message.length > 100 && (
              <div className="absolute right-3 bottom-3 text-xs px-1.5 py-0.5 rounded bg-gray-800/70 text-gray-300">
                {message.length}
              </div>
            )}
          </div>

          <Button
            size="icon"
            onClick={handleSendMessage}
            className="h-10 w-10 bg-chat-primary text-white hover:bg-chat-primary/90 rounded-full flex-shrink-0"
            disabled={
              message.trim().length === 0 && attachmentItems.length === 0
            }
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        {/* Keyboard shortcuts hint */}
        {message.length > 60 && (
          <div className="mt-1 text-xs text-gray-500 text-right">
            Shift+Enter for line break • Enter to send
          </div>
        )}
      </div>
    </div>
  );
}

// Also export as default for backward compatibility
export default MessageInput;
