"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

const users = ["gnydrm", "fsahinbas"];

// const messagesData = [
//   {
//     username: "gnydrm",
//     message: "What is the purpose of the `utils.py` file in our project?",
//     timestamp: "2023-02-20T14:30:00.000Z",
//   },

//   {
//     username: "fsahinbas",
//     message:
//       "How do I fix the error \"Cannot read property 'length' of undefined\" in my JavaScript code?",
//     timestamp: "2023-02-20T14:35:00.000Z",
//   },

//   {
//     user_id: "gnydrm",
//     message: "What is the syntax for creating a new branch in Git?",
//     timestamp: "2023-02-20T14:40:00.000Z",
//   },

//   {
//     user_id: "fsahinbas",
//     message:
//       "I'm trying to implement a sorting algorithm in Python. Can you help me with the implementation?",
//     timestamp: "2023-02-20T14:45:00.000Z",
//   },
// ];

type MessageType = {
  id: string;
  body: string;
  username: string;
  created_at: string;
};
export default function Home() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const supabase = supabaseBrowserClient();
    supabase
      .from("messages")
      .select()
      .then((res) => {
        setMessages(res.data as MessageType[]);
      });
  }, []);

  useEffect(() => {
    const supabase = supabaseBrowserClient();
    supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            //router.refresh();

            setMessages((prev) => [...prev, payload.new as MessageType]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.channel("public:messages").unsubscribe();
    };
  }, []);

  const handleAddMessage = async () => {
    const supabase = await supabaseBrowserClient();

    await supabase.from("messages").insert({
      username: users[Math.floor(Math.random() * users.length - 1)],
      body: message,
    });

    setMessage("");
  };

  return (
    <main className="min-h-screen flex items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>SupaCHAT</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="flex p-2 flex-col justify-between border-2 border-dashed border-gray-300 max-h-96 min-h-96 w-[600px]">
            <div className="flex-1">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex w-full  justify-between p-2 border-b border-gray-300`}
                >
                  <span>{message.body}</span>
                  <span className="text-muted-foreground">
                    {message.username}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex w-full justify-between gap-4">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button onClick={handleAddMessage}>Send</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
