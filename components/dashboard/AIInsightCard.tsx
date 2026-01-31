import { Lightbulb, Info, Share2 } from 'lucide-react';

interface AIInsightCardProps {
  insight: string;
  onLearnMore?: () => void;
  onShare?: () => void;
}

export function AIInsightCard({ insight, onLearnMore, onShare }: AIInsightCardProps) {
  return (
    <div className="bg-linear-to-br from-purple-50 to-blue-50 rounded-xl p-6 card-shadow-lg border border-purple-100">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0">
          <Lightbulb className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <h3 className="text-lg font-bold text-gray-900">
              Insight AI Minggu Ini
            </h3>
            <span className="text-xs font-semibold bg-purple-200 text-purple-800 px-2 py-1 rounded">
              POWERED BY AI
            </span>
          </div>
          <p
            className="text-gray-700 leading-relaxed mb-4"
            dangerouslySetInnerHTML={{ __html: insight }}
          />
          <div className="flex items-center space-x-4">
            <button
              onClick={onLearnMore}
              className="text-sm font-medium text-purple-700 hover:text-purple-800 flex items-center space-x-2"
            >
              <Info className="w-4 h-4" />
              <span>Pelajari Lebih Lanjut</span>
            </button>
            <button
              onClick={onShare}
              className="text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Bagikan ke Tim</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
