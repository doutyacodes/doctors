'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, ArrowRight, CheckCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function MBTITest() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  const token = searchParams.get('token');

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Fetch questions on mount
  useEffect(() => {
    if (!token && !patientId) {
      setError('Missing token or patient ID');
      setLoading(false);
      return;
    }
    fetchQuestions();
  }, [token, patientId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const url = token
        ? `/api/mbti/questions?token=${token}`
        : `/api/mbti/questions`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok && data.questions) {
        setQuestions(data.questions);
      } else {
        setError(data.error || 'Failed to load questions');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Error loading test questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (selectedOption) => {
    const newAnswers = [...answers, {
      questionId: questions[currentQuestion].id,
      optionId: selectedOption.id,
      analyticId: selectedOption.analyticId
    }];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Test completed - submit with the final answer
      handleComplete([...newAnswers]);
    }
  };

  const handleComplete = async (finalAnswers) => {
    setIsCompleting(true);
    try {
      const response = await fetch('/api/mbti/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          patientId,
          answers: finalAnswers
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult(data.result);
        // Show result for 3 seconds then redirect
        setTimeout(() => {
          if (token) {
            // Public test completed
            router.push('/test/mbti/complete');
          } else {
            // Doctor test completed
            router.push(`/patient/${patientId}`);
          }
        }, 3000);
      } else {
        setError(data.error || 'Failed to submit test');
        setIsCompleting(false);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      setError('Error submitting test results');
      setIsCompleting(false);
    }
  };

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading test questions...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  // No questions loaded
  if (questions.length === 0) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <p className="text-gray-600">No questions available</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center gap-3 mb-4"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">MBTI Assessment</h1>
            </motion.div>
            <p className="text-gray-600 mb-6">
              Answer each question based on your natural preferences
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <motion.div
                className="h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-xl">
                <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                  {questions[currentQuestion].questionText}
                </h2>

                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, index) => (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(option)}
                      className="w-full p-5 text-left bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg text-gray-700 group-hover:text-purple-600 transition-colors">
                          {option.optionText}
                        </span>
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-purple-500 flex items-center justify-center transition-colors">
                          <div className="w-3 h-3 rounded-full bg-transparent group-hover:bg-purple-500 transition-colors" />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Info Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-gray-500 mt-6"
          >
            There are no right or wrong answers. Choose the option that feels most natural to you.
          </motion.p>
        </motion.div>
      </div>

      {/* Completing Overlay */}
      {isCompleting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md"
          >
            {!testResult ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4"
                >
                  <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Processing Results</h3>
                <p className="text-gray-600">Analyzing your responses...</p>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Test Complete!</h3>
                <p className="text-gray-600 mb-4">Your personality type is:</p>
                <div className="text-5xl font-bold text-purple-600 mb-2">
                  {testResult.personalityType}
                </div>
                <p className="text-sm text-gray-500">Redirecting...</p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
