'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, ArrowRight, ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function RIASECTestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  const token = searchParams.get('token');

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resolvedPatientId, setResolvedPatientId] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const url = token
        ? `/api/riasec/questions?token=${token}`
        : `/api/riasec/questions`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok && data.success) {
        setQuestions(data.questions);
      } else {
        setError(data.error || 'Failed to fetch questions');
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('An error occurred while loading questions');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionId, scoreValue) => {
    const currentQ = questions[currentQuestion];

    // Update or add answer for current question
    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex(
      a => a.questionId === currentQ.id
    );

    const answer = {
      questionId: currentQ.id,
      personalityTypeId: currentQ.personalityTypeId,
      optionId: optionId,
      scoreValue: scoreValue
    };

    if (existingIndex >= 0) {
      newAnswers[existingIndex] = answer;
    } else {
      newAnswers.push(answer);
    }

    setAnswers(newAnswers);
  };

  const getCurrentAnswer = () => {
    const currentQ = questions[currentQuestion];
    return answers.find(a => a.questionId === currentQ.id);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsCompleting(true);

    try {
      const payload = {
        answers,
      };

      // Add either patientId or token
      if (token) {
        payload.token = token;
      } else if (patientId) {
        payload.patientId = parseInt(patientId);
      }

      const response = await fetch('/api/riasec/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Show success message for token-based submissions
        if (token) {
          alert('Test completed successfully! You can close this window.');
          // Optionally redirect to a thank you page
          router.push('/');
        } else if (patientId) {
          // Redirect back to patient page for logged-in doctors
          router.push(`/patient/${patientId}`);
        }
      } else {
        console.error('Submit error:', data.error);
        setError(data.error || 'Failed to submit test');
        setIsCompleting(false);
      }
    } catch (err) {
      console.error('Error submitting test:', err);
      setError('An error occurred while submitting the test');
      setIsCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-50 flex items-center justify-center">
        <Card className="p-8 max-w-md mx-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()} variant="outline">Go Back</Button>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-50 flex items-center justify-center">
        <Card className="p-8 max-w-md mx-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Questions Available</h2>
          <p className="text-gray-600 mb-4">There are no RIASEC questions configured.</p>
          <Button onClick={() => router.back()} variant="outline">Go Back</Button>
        </Card>
      </div>
    );
  }

  const currentAnswer = getCurrentAnswer();
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const canProceed = currentAnswer !== undefined;
  const currentQuestionData = questions[currentQuestion];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="mb-6 sm:mb-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4"
            >
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">RIASEC Assessment</h1>
            </motion.div>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
              Rate each statement based on how much you agree or disagree
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3 mb-2">
              <motion.div
                className="h-2.5 sm:h-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
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
              <Card className="p-4 sm:p-6 md:p-8 bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-xl">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8 text-center leading-tight px-2">
                  {currentQuestionData.questionText}
                </h2>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-3 mb-6 sm:mb-8">
                  {currentQuestionData.options.map((option) => (
                    <motion.button
                      key={option.id}
                      onClick={() => handleOptionSelect(option.id, option.scoreValue)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-3 sm:p-4 text-center rounded-lg sm:rounded-xl border-2 transition-all duration-300 ${
                        currentAnswer?.optionId === option.id
                          ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white border-teal-600 shadow-lg scale-105'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-teal-300'
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-medium leading-tight">
                        {option.optionText.split(' ').map((word, i) => (
                          <div key={i} className="whitespace-nowrap">{word}</div>
                        ))}
                      </div>
                      {currentAnswer?.optionId === option.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mt-2"
                        >
                          <div className="w-5 h-5 mx-auto rounded-full bg-white/30 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-white" />
                          </div>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-2 sm:gap-3">
                  {currentQuestion > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      className="flex-1 h-10 sm:h-12 text-sm sm:text-base border-gray-300 hover:bg-gray-50"
                    >
                      <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                      <span className="hidden xs:inline">Previous</span>
                    </Button>
                  )}
                  {isLastQuestion ? (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!canProceed || isCompleting}
                      className="flex-1 h-10 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg shadow-teal-500/30"
                    >
                      <span className="hidden xs:inline">Submit Test</span>
                      <span className="xs:hidden">Submit</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={!canProceed}
                      className="flex-1 h-10 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg shadow-teal-500/30"
                    >
                      <span className="hidden xs:inline">Next</span>
                      <span className="xs:hidden">→</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 hidden xs:inline" />
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Info Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6 px-4"
          >
            Select the option that best represents your feelings towards each statement
          </motion.p>
        </motion.div>
      </div>

      {/* Completing Overlay */}
      {isCompleting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl text-center max-w-md w-full mx-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-teal-200 border-t-teal-600 rounded-full" />
            </motion.div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Processing Results</h3>
            <p className="text-sm sm:text-base text-gray-600">Analyzing your career interests...</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default function RIASECTest() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    }>
      <RIASECTestContent />
    </Suspense>
  );
}
