import Lottie from "lottie-react";
import React, { useEffect, useState } from "react";
import { Player } from "react-simple-player";
import "./App.css";
import loader from "./loader.json";
import NewArticleModal from "./Modal";

type ProgressState = "idle" | "extractingContent" | "generatingAudio" | "done";

function useSynth(articleUrl: string) {
  const [progress, setProgress] = useState<ProgressState>("idle");
  const [articleContent, setArticleContent] = useState<{
    content: string;
    title: string;
  }>();
  const [audioUrl, setAudioUrl] = useState<string>("");

  useEffect(() => {
    if (articleUrl === "") return;

    const ws = new WebSocket(
      "wss://u0zldddco0.execute-api.eu-west-1.amazonaws.com/dev"
    );

    ws.onopen = () => {
      setProgress("extractingContent");

      ws.send(
        JSON.stringify({
          action: "post",
          articleUrl,
        })
      );

      ws.onmessage = async (event) => {
        const result = JSON.parse(event.data);

        if (result.type === "contentExtracted") {
          const contentResponse = await fetch(result.contentUrl);
          const content = await contentResponse.json();
          setArticleContent(content);
          setProgress("generatingAudio");
        }

        if (result.type === "audioGenerated") {
          const audioUrl = result.audioUrl;
          setAudioUrl(audioUrl);
          setProgress("done");
        }
      };
    };

    return () => {
      ws.close();
    };
  }, [articleUrl]);

  return {
    progress,
    articleContent,
    audioUrl,
  };
}

type ArticleContentProps = {
  articleContent: { title: string; content: string };
  audioUrl: string;
  progress: ProgressState;
};

const ArticleContent = ({
  articleContent,
  audioUrl,
  progress,
}: ArticleContentProps) => {
  return (
    <>
      {articleContent && (
        <>
          <h1 className="pt-5">{articleContent.title}</h1>
          {progress === "generatingAudio" && (
            <div className="flex items-center font-light">
              <Lottie animationData={loader} loop style={{ width: 60 }} />
              Generating Audio
            </div>
          )}
          {progress === "done" && audioUrl && (
            <div className="my-5">
              <Player src={audioUrl} height={40} />
            </div>
          )}
          <div
            dangerouslySetInnerHTML={{ __html: articleContent.content }}
          ></div>
        </>
      )}
    </>
  );
};

function App() {
  const [open, setOpen] = useState(false);
  const [articleUrl, setArticleUrl] = useState("");

  const { articleContent, audioUrl, progress } = useSynth(articleUrl);

  return (
    <div>
      <div className="flex justify-center items-center mt-10">
        <div className="bg-white w-full  rounded-2xl max-w-5xl shadow-xl article z-10">
          {progress === "idle" && (
            <div className="flex flex-col justify-center items-center h-96  font-light">
              <img className="w-20 h-20" src="/newspaper.png" alt="logo" />
              <button
                onClick={() => setOpen(!open)}
                type="button"
                className="z-20 inline-flex items-center mt-3 px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Get started here
              </button>
            </div>
          )}

          {progress === "extractingContent" && (
            <div className="flex flex-col justify-center items-center h-96  font-light">
              <Lottie animationData={loader} loop style={{ width: 100 }} />
              Extracting content
            </div>
          )}

          {articleContent && (
            <ArticleContent
              articleContent={articleContent}
              audioUrl={audioUrl}
              progress={progress!}
            />
          )}
        </div>
      </div>
      <div className="fixed h-96 bg-indigo-500 w-full top-0"></div>

      {progress !== "idle" && (
        <button
          onClick={() => setOpen(!open)}
          type="button"
          className="fixed z-20 bottom-6 right-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          + Listen to a new article
        </button>
      )}
      <NewArticleModal
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        onSelectArticle={(url) => {
          setOpen(false);
          setArticleUrl(url);
        }}
      />
    </div>
  );
}

export default App;
