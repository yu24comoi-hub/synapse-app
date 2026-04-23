type Props = {
  question: string;
};

export default function QuestionPrompt({ question }: Props) {
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
      <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
        ソクラテスの問い
      </p>
      <p className="text-lg font-medium text-indigo-900 leading-relaxed">{question}</p>
    </div>
  );
}
