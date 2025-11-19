'use client';

import {
  Branch,
  BranchMessages,
  BranchNext,
  BranchPage,
  BranchPrevious,
  BranchSelector
} from '@/components/ai-elements/branch';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageAvatar,
  MessageContent
} from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools
} from '@/components/ai-elements/prompt-input';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger
} from '@/components/ai-elements/reasoning';
import { Response } from '@/components/ai-elements/response';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger
} from '@/components/ai-elements/sources';
import type { ToolUIPart } from 'ai';
import { GlobeIcon, MicIcon } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useCallback, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { llmChatService } from '@/services/llmChat';

type MessageType = {
  key: string;
  from: 'user' | 'assistant';
  sources?: { href: string; title: string }[];
  versions: {
    id: string;
    content: string;
  }[];
  reasoning?: {
    content: string;
    duration: number;
  };
  tools?: {
    name: string;
    description: string;
    status: ToolUIPart['state'];
    parameters: Record<string, unknown>;
    result: string | undefined;
    error: string | undefined;
  }[];
  avatar: string;
  name: string;
  type?: 'thinking' | 'quiz_artifact' | 'video_artifact';
};

const initialMessages: MessageType[] = [];

const models = [
  { id: 'gpt-4', name: 'GPT-4' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  { id: 'claude-2', name: 'Claude 2' },
  { id: 'claude-instant', name: 'Claude Instant' },
  { id: 'palm-2', name: 'PaLM 2' },
  { id: 'llama-2-70b', name: 'Llama 2 70B' },
  { id: 'llama-2-13b', name: 'Llama 2 13B' },
  { id: 'cohere-command', name: 'Command' },
  { id: 'mistral-7b', name: 'Mistral 7B' }
];

const mockResponses = [
  "That's a great question! Let me help you understand this concept better. The key thing to remember is that proper implementation requires careful consideration of the underlying principles and best practices in the field.",
  "I'd be happy to explain this topic in detail. From my understanding, there are several important factors to consider when approaching this problem. Let me break it down step by step for you.",
  "This is an interesting topic that comes up frequently. The solution typically involves understanding the core concepts and applying them in the right context. Here's what I recommend...",
  "Great choice of topic! This is something that many developers encounter. The approach I'd suggest is to start with the fundamentals and then build up to more complex scenarios.",
  "That's definitely worth exploring. From what I can see, the best way to handle this is to consider both the theoretical aspects and practical implementation details."
];

const Example = () => {
  const [model, setModel] = useState<string>(models[0].id);
  const [text, setText] = useState<string>('');
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const [useMicrophone, setUseMicrophone] = useState<boolean>(false);
  const [status, setStatus] = useState<
    'submitted' | 'streaming' | 'ready' | 'error'
  >('ready');
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  );
  const [chatId, setChatId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const streamingContentRef = useRef<string>('');
  // Initialize chat session on mount
  useEffect(() => {
    const initChat = async () => {
      try {
        const newChatId = nanoid();
        setChatId(newChatId);
        
        // Initialize the chat with socket connection
        await llmChatService.initializeChat(newChatId);
        setIsInitialized(true);
        
        toast.success('Chat initialized', {
          description: 'Connected to chatbot service'
        });
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        const errorMessage = error instanceof Error ? error.message : 'Could not connect to chatbot service';
        toast.error('Connection failed', {
          description: errorMessage,
          duration: 10000,
        });
        setStatus('error');
      }
    };

    initChat();

    // Cleanup on unmount
    return () => {
      llmChatService.removeAllListeners();
      llmChatService.disconnect();
    };
  }, []);

  // Setup socket event listeners
  useEffect(() => {
    if (!isInitialized) return;

    // Handle incoming chunks from AI
    const handleChunk = (data: { chunk: string }) => {
      streamingContentRef.current += data.chunk;
      
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.key === streamingMessageId && msg.type !== 'thinking') {
            return {
              ...msg,
              versions: msg.versions.map((v) =>
                v.id === streamingMessageId
                  ? { ...v, content: streamingContentRef.current }
                  : v
              )
            };
          }
          return msg;
        })
      );
    };

    // Handle thinking start
    const handleThinkingStart = () => {
      const thinkingMessageId = `thinking-${Date.now()}`;
      setStreamingMessageId(thinkingMessageId);

      const thinkingMessage: MessageType = {
        key: thinkingMessageId,
        from: 'assistant',
        type: 'thinking',
        versions: [
          {
            id: thinkingMessageId,
            content: 'Thinking...'
          }
        ],
        avatar: 'https://github.com/openai.png',
        name: 'Assistant'
      };

      setMessages((prev) => [...prev, thinkingMessage]);
    };

    // Handle thinking end
    const handleThinkingEnd = () => {
      setMessages((prev) => prev.filter((msg) => msg.type !== 'thinking'));
    };

    // Handle generation complete
    const handleGenerationComplete = () => {
      setStatus('ready');
      setStreamingMessageId(null);
      streamingContentRef.current = '';
    };

    // Handle errors
    const handleError = (error: any) => {
      console.error('Socket error:', error);
      toast.error('Chat error', {
        description: error.message || 'An error occurred'
      });
      setStatus('error');
      setMessages((prev) => prev.filter((msg) => msg.type !== 'thinking'));
    };

    // Handle reconnection
    const handleReconnect = async () => {
      try {
        await llmChatService.joinRoom({ chat_id: chatId });
        toast.info('Reconnected', {
          description: 'Chat session restored'
        });
      } catch (error) {
        console.error('Reconnection failed:', error);
      }
    };

    // Register listeners
    llmChatService.onChunk(handleChunk);
    llmChatService.onThinkingStart(handleThinkingStart);
    llmChatService.onThinkingEnd(handleThinkingEnd);
    llmChatService.onGenerationComplete(handleGenerationComplete);
    llmChatService.onError(handleError);
    llmChatService.onReconnect(handleReconnect);

    return () => {
      llmChatService.removeAllListeners();
    };
  }, [isInitialized, chatId, streamingMessageId]);

  const sendMessage = useCallback(
    async (content: string, attachments?: string[]) => {
      if (!isInitialized || !chatId) {
        toast.error('Chat not ready', {
          description: 'Please wait for chat to initialize'
        });
        return;
      }

      try {
        // Add user message to UI
        const userMessage: MessageType = {
          key: `user-${Date.now()}`,
          from: 'user',
          versions: [
            {
              id: `user-${Date.now()}`,
              content
            }
          ],
          avatar: 'https://github.com/haydenbleasel.png',
          name: 'User'
        };

        setMessages((prev) => [...prev, userMessage]);

        // Send message via socket
        await llmChatService.sendMessage({
          conversation_id: chatId,
          content,
          attachments: attachments || []
        });

        // Prepare for AI response
        const assistantMessageId = `assistant-${Date.now()}`;
        setStreamingMessageId(assistantMessageId);
        streamingContentRef.current = '';

        const assistantMessage: MessageType = {
          key: assistantMessageId,
          from: 'assistant',
          versions: [
            {
              id: assistantMessageId,
              content: ''
            }
          ],
          avatar: 'https://github.com/openai.png',
          name: 'Assistant'
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setStatus('streaming');
      } catch (error) {
        console.error('Failed to send message:', error);
        toast.error('Send failed', {
          description: 'Could not send message'
        });
        setStatus('error');
      }
    },
    [isInitialized, chatId]
  );

  const handleSubmit = async (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    setStatus('submitted');

    // Handle file attachments (placeholder - implement file upload if needed)
    let attachmentUrls: string[] = [];
    if (message.files?.length) {
      toast.info('Files attached', {
        description: `${message.files.length} file(s) will be processed`
      });
      // TODO: Upload files to storage and get URLs
      // For now, just use file URLs/names as placeholders
      attachmentUrls = message.files.map(f => f.url || 'attachment');
    }

    await sendMessage(message.text || 'Sent with attachments', attachmentUrls);
    setText('');
  };

  return (
    <div className='relative flex size-full h-[91vh] flex-col divide-y overflow-hidden'>
      <Conversation>
        <ConversationContent>
          {messages.map(({ versions, ...message }) => (
            <Branch defaultBranch={0} key={message.key}>
              <BranchMessages>
                {versions.map((version) => (
                  <Message
                    from={message.from}
                    key={`${message.key}-${version.id}`}
                  >
                    <div>
                      {message.sources?.length && (
                        <Sources>
                          <SourcesTrigger count={message.sources.length} />
                          <SourcesContent>
                            {message.sources.map((source) => (
                              <Source
                                href={source.href}
                                key={source.href}
                                title={source.title}
                              />
                            ))}
                          </SourcesContent>
                        </Sources>
                      )}
                      {message.reasoning && (
                        <Reasoning duration={message.reasoning.duration}>
                          <ReasoningTrigger />
                          <ReasoningContent>
                            {message.reasoning.content}
                          </ReasoningContent>
                        </Reasoning>
                      )}
                      <MessageContent>
                        <Response>{version.content}</Response>
                      </MessageContent>
                    </div>
                    <MessageAvatar name={message.name} src={message.avatar} />
                  </Message>
                ))}
              </BranchMessages>
              {versions.length > 1 && (
                <BranchSelector from={message.from}>
                  <BranchPrevious />
                  <BranchPage />
                  <BranchNext />
                </BranchSelector>
              )}
            </Branch>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className='grid shrink-0 gap-4 pt-4'>
        <div className='w-full px-4 pb-4'>
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
            <PromptInputHeader>
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
            </PromptInputHeader>
            <PromptInputBody>
              <PromptInputTextarea
                onChange={(event) => setText(event.target.value)}
                value={text}
              />
            </PromptInputBody>
            <PromptInputFooter className='py-1'>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <PromptInputButton
                  onClick={() => setUseMicrophone(!useMicrophone)}
                  variant={useMicrophone ? 'default' : 'ghost'}
                >
                  <MicIcon size={16} />
                  <span className='sr-only'>Microphone</span>
                </PromptInputButton>
                <PromptInputButton
                  onClick={() => setUseWebSearch(!useWebSearch)}
                  variant={useWebSearch ? 'default' : 'ghost'}
                >
                  <GlobeIcon size={16} />
                  <span>Search</span>
                </PromptInputButton>
                <PromptInputModelSelect onValueChange={setModel} value={model}>
                  <PromptInputModelSelectTrigger>
                    <PromptInputModelSelectValue />
                  </PromptInputModelSelectTrigger>
                  <PromptInputModelSelectContent>
                    {models.map((model) => (
                      <PromptInputModelSelectItem
                        key={model.id}
                        value={model.id}
                      >
                        {model.name}
                      </PromptInputModelSelectItem>
                    ))}
                  </PromptInputModelSelectContent>
                </PromptInputModelSelect>
              </PromptInputTools>
              <PromptInputSubmit
                disabled={!isInitialized || !(text.trim() || status) || status === 'streaming'}
                status={status}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
};

export default Example;
