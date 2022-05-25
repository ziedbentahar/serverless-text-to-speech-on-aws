type ProcessingEvents =
  | {
      type: "contentExtracted";
      articleUrl: string;
      contentUrl: string;
    }
  | {
      type: "audioGenerated";
      articleUrl: string;
      audioUrl: string;
    }
  | {
      type: "audioGenerationProgress";
      articleUrl: string;
      percent: number;
    }
  | { type: "error"; articleUrl: string; error: Error };


export default ProcessingEvents;