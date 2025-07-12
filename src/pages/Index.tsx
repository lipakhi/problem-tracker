
import ProblemTracker from "@/components/ProblemTracker";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6">
        <header className="mb-4 text-center">
          <h1 className="text-3xl font-bold text-purple-800 mb-2">Problem Tracker</h1>
          <p className="text-gray-600">Track your daily problem-solving progress</p>
        </header>
        
        <div className="max-w-4xl mx-auto">
          <ProblemTracker />
        </div>
      </div>
    </div>
  );
};

export default Index;
