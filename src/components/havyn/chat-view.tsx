"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Send, Sparkles } from "lucide-react";
import { BotMessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Message } from "@/lib/types";
import { generatePromptAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

const initialMessage: Message = {
  id: "initial",
  role: "assistant",
  content: "Hello! I'm Havyn, your personal companion. How are you feeling today? What's on your mind?",
};

export function ChatView({ onNewPrompt }: { onNewPrompt: (prompt: string) => void }) {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      isLoading: true,
    };
    
    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInput("");

    startTransition(async () => {
      try {
        const result = await generatePromptAction({ mood: "unspecified", recentThoughts: input });
        if (result && result.prompt) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: result,
          };
          setMessages((prev) => [...prev.slice(0, -1), assistantMessage]);
        } else {
          throw new Error("Failed to get a response.");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not get a response from the AI. Please try again.",
          variant: "destructive",
        });
        setMessages((prev) => prev.slice(0, -1)); // Remove loading message
      }
    });
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <div className="flex-grow space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className={`flex items-end gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            {message.role === "assistant" && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground shrink-0">
                <BotMessageSquare size={20} />
              </div>
            )}
            <Card className={`max-w-sm ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
              <CardContent className="p-3">
                {message.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Skeleton className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <Skeleton className="w-2 h-2 rounded-full bg-accent animate-pulse [animation-delay:0.2s]" />
                    <Skeleton className="w-2 h-2 rounded-full bg-accent animate-pulse [animation-delay:0.4s]" />
                  </div>
                ) : typeof message.content === 'string' ? (
                  <p className="text-sm">{message.content}</p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">Here is a prompt to get you started:</p>
                    <p className="text-sm italic p-3 border-l-2 border-accent bg-background rounded-r-md">
                      "{message.content.prompt}"
                    </p>
                    <Button
                      size="sm"
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                      onClick={() => onNewPrompt(message.content.prompt)}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Start Journaling
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell me anything..."
          className="flex-grow resize-none"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button onClick={handleSendMessage} disabled={isPending || !input.trim()} className="self-end">
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
}
