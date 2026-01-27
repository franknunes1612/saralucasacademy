import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Clock, Flame, ExternalLink } from "lucide-react";

interface TrainingClass {
  id: string;
  title: string;
  duration: string;
  calories: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  thumbnailEmoji: string;
  externalUrl: string;
}

const TRAINING_CLASSES: TrainingClass[] = [
  {
    id: "1",
    title: "Morning Energizer",
    duration: "15 min",
    calories: "~120 kcal",
    level: "Beginner",
    category: "Cardio",
    thumbnailEmoji: "🌅",
    externalUrl: "https://www.youtube.com/results?search_query=15+min+morning+cardio+workout"
  },
  {
    id: "2",
    title: "Full Body Strength",
    duration: "30 min",
    calories: "~250 kcal",
    level: "Intermediate",
    category: "Strength",
    thumbnailEmoji: "💪",
    externalUrl: "https://www.youtube.com/results?search_query=30+min+full+body+strength+workout"
  },
  {
    id: "3",
    title: "HIIT Fat Burner",
    duration: "20 min",
    calories: "~300 kcal",
    level: "Advanced",
    category: "HIIT",
    thumbnailEmoji: "🔥",
    externalUrl: "https://www.youtube.com/results?search_query=20+min+hiit+fat+burner"
  },
  {
    id: "4",
    title: "Yoga Flow",
    duration: "25 min",
    calories: "~80 kcal",
    level: "Beginner",
    category: "Yoga",
    thumbnailEmoji: "🧘",
    externalUrl: "https://www.youtube.com/results?search_query=25+min+yoga+flow+beginners"
  },
  {
    id: "5",
    title: "Core Crusher",
    duration: "10 min",
    calories: "~100 kcal",
    level: "Intermediate",
    category: "Core",
    thumbnailEmoji: "🎯",
    externalUrl: "https://www.youtube.com/results?search_query=10+min+core+workout"
  },
  {
    id: "6",
    title: "Lower Body Sculpt",
    duration: "25 min",
    calories: "~200 kcal",
    level: "Intermediate",
    category: "Strength",
    thumbnailEmoji: "🦵",
    externalUrl: "https://www.youtube.com/results?search_query=25+min+lower+body+workout"
  }
];

function getLevelColor(level: TrainingClass["level"]) {
  switch (level) {
    case "Beginner": return "bg-success/20 text-success";
    case "Intermediate": return "bg-warning/20 text-warning";
    case "Advanced": return "bg-destructive/20 text-destructive";
  }
}

function TrainingCard({ training }: { training: TrainingClass }) {
  const handleClick = () => {
    window.open(training.externalUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      className="w-full result-card p-4 text-left hover:bg-white/5 transition-colors"
    >
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center text-3xl flex-shrink-0">
          {training.thumbnailEmoji}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-white truncate">{training.title}</h3>
            <ExternalLink className="h-4 w-4 text-white/40 flex-shrink-0" />
          </div>
          
          <p className="text-xs text-white/60 mb-2">{training.category}</p>
          
          <div className="flex flex-wrap gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getLevelColor(training.level)}`}>
              {training.level}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              {training.duration}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 flex items-center gap-1">
              <Flame className="h-2.5 w-2.5" />
              {training.calories}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function TrainingClasses() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-4 py-5 safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Training Classes</h1>
          <p className="text-xs text-white/60">On-demand workout videos</p>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-2 -mx-4 px-4">
        {["All", "Cardio", "Strength", "HIIT", "Yoga", "Core"].map((category) => (
          <button
            key={category}
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-white/10 text-white/80 hover:bg-white/20 transition-colors first:bg-primary first:text-primary-foreground"
          >
            {category}
          </button>
        ))}
      </div>

      {/* Classes list */}
      <div className="space-y-3">
        {TRAINING_CLASSES.map((training) => (
          <TrainingCard key={training.id} training={training} />
        ))}
      </div>

      {/* Info banner */}
      <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-start gap-3">
          <Play className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-white/80 font-medium mb-1">
              External video links
            </p>
            <p className="text-xs text-white/60">
              Classes open in YouTube. We're curating the best fitness content for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
