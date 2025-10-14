"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  Award,
  Brain,
  Calendar,
  Mail,
  Phone,
  Target,
  TrendingDown,
  TrendingUp,
  User,
  Zap,
  ArrowLeft,
  Share2,
  Download,
  Copy,
  Link2,
  CheckCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function PatientDetail() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id;

  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [mbtiProgress, setMbtiProgress] = useState(null);
  const [loadingMbti, setLoadingMbti] = useState(true);
  const [riasecProgress, setRiasecProgress] = useState(null);
  const [loadingRiasec, setLoadingRiasec] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copySuccessRiasec, setCopySuccessRiasec] = useState(false);

  // Fetch patient and test data on mount
  useEffect(() => {
    fetchPatient();
    fetchMBTIProgress();
    fetchRIASECProgress();
  }, [patientId]);

  const fetchPatient = async () => {
    try {
      setLoadingPatient(true);
      const response = await fetch(`/api/patients/${patientId}`);
      const data = await response.json();

      if (response.ok && data.patient) {
        setPatient(data.patient);
      } else {
        console.error('Failed to fetch patient:', data.error);
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
    } finally {
      setLoadingPatient(false);
    }
  };

  const fetchMBTIProgress = async () => {
    try {
      setLoadingMbti(true);
      const response = await fetch(`/api/mbti/progress/${patientId}`);
      const data = await response.json();

      if (response.ok) {
        // API returns { success, hasTest, status, progress, result, testLink }
        setMbtiProgress(data);
      } else {
        console.error('Failed to fetch MBTI progress:', data.error);
      }
    } catch (error) {
      console.error('Error fetching MBTI progress:', error);
    } finally {
      setLoadingMbti(false);
    }
  };

  const fetchRIASECProgress = async () => {
    try {
      setLoadingRiasec(true);
      const response = await fetch(`/api/riasec/progress?patientId=${patientId}`);
      const data = await response.json();

      if (response.ok) {
        setRiasecProgress(data);
      } else {
        console.error('Failed to fetch RIASEC progress:', data.error);
      }
    } catch (error) {
      console.error('Error fetching RIASEC progress:', error);
    } finally {
      setLoadingRiasec(false);
    }
  };

  const handleStartMBTI = async () => {
    try {
      const response = await fetch('/api/mbti/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId }),
      });

      const data = await response.json();

      if (response.ok) {
        // API returns { success, progress, testLink, message }
        // Update state with the new progress data
        await fetchMBTIProgress(); // Refresh the progress
        // Navigate to test page
        router.push(`/test/mbti?patientId=${patientId}`);
      } else {
        console.error('Failed to start test:', data.error);
      }
    } catch (error) {
      console.error('Error starting MBTI test:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      // If no test link exists, start the test first
      if (!mbtiProgress?.testLink) {
        const response = await fetch('/api/mbti/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId }),
        });

        const data = await response.json();

        if (response.ok && data.testLink) {
          await navigator.clipboard.writeText(data.testLink);
          await fetchMBTIProgress(); // Refresh the progress
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } else {
          console.error('Failed to generate test link:', data.error);
        }
      } else {
        // Test link already exists, just copy it
        await navigator.clipboard.writeText(mbtiProgress.testLink);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const handleStartRIASEC = async () => {
    try {
      const response = await fetch('/api/riasec/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchRIASECProgress();
        router.push(`/test/riasec?patientId=${patientId}`);
      } else {
        console.error('Failed to start RIASEC test:', data.error);
      }
    } catch (error) {
      console.error('Error starting RIASEC test:', error);
    }
  };

  const handleCopyLinkRiasec = async () => {
    try {
      if (!riasecProgress?.testLink) {
        const response = await fetch('/api/riasec/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patientId }),
        });

        const data = await response.json();

        if (response.ok && data.testLink) {
          await navigator.clipboard.writeText(data.testLink);
          await fetchRIASECProgress();
          setCopySuccessRiasec(true);
          setTimeout(() => setCopySuccessRiasec(false), 2000);
        } else {
          console.error('Failed to generate test link:', data.error);
        }
      } else {
        await navigator.clipboard.writeText(riasecProgress.testLink);
        setCopySuccessRiasec(true);
        setTimeout(() => setCopySuccessRiasec(false), 2000);
      }
    } catch (error) {
      console.error('Error copying RIASEC link:', error);
    }
  };

  // MBTI Assessment Data
  const mbtiData = {
    type: "INFJ",
    fullType: "Introverted, Intuitive, Feeling, Judging",
    description:
      "The Advocate - Insightful, creative, and deeply idealistic individuals who seek meaning and authenticity in their relationships.",
    strengths: [
      "Creative and insightful",
      "Strong sense of integrity",
      "Passionate and dedicated",
      "Empathetic and compassionate",
      "Natural ability to inspire others",
    ],
    weaknesses: [
      "Sensitive to criticism",
      "Prone to burnout",
      "Perfectionist tendencies",
      "Difficulty with confrontation",
      "Can be overly idealistic",
    ],
    opportunities: [
      "Leadership in humanitarian roles",
      "Creative and artistic pursuits",
      "Counseling and mentoring",
      "Strategic planning and vision",
      "Building meaningful relationships",
    ],
    threats: [
      "High stress environments",
      "Lack of work-life balance",
      "Dismissive or cynical people",
      "Routine without purpose",
      "Conflict and discord",
    ],
    cognitiveStack: [
      {
        function: "Introverted Intuition (Ni)",
        description: "Primary way of perceiving the world",
      },
      {
        function: "Extraverted Feeling (Fe)",
        description: "Making decisions based on values",
      },
      {
        function: "Introverted Thinking (Ti)",
        description: "Analyzing information logically",
      },
      {
        function: "Extraverted Sensing (Se)",
        description: "Experiencing the present moment",
      },
    ],
  };


  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loadingPatient || !patient) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading patient details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </motion.div>

          {/* Patient Info Card */}
          <Card className="mb-6 bg-white/70 backdrop-blur-sm border-gray-200/50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6 flex-1">
                  <Avatar className="w-24 h-24 ring-4 ring-blue-100 shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-semibold">
                      {getInitials(patient.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {patient.fullName}
                    </h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4 text-blue-600" />
                        <span>{patient.age} years • {patient.gender}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span>{patient.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span>{patient.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>Registered: {new Date(patient.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row lg:flex-col gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 lg:flex-none border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 lg:flex-none border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assessment Selection */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Assessment Reports
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* MBTI Card */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  onClick={() => mbtiProgress?.result && setSelectedAssessment("mbti")}
                  className={`transition-all duration-300 border-2 bg-white/70 backdrop-blur-sm ${
                    selectedAssessment === "mbti"
                      ? "border-purple-500 shadow-xl shadow-purple-500/20"
                      : "border-gray-200/50 hover:border-purple-200 hover:shadow-lg"
                  } ${!mbtiProgress?.result ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Brain className="w-7 h-7 text-white" />
                      </div>
                      {mbtiProgress?.progress?.status === 'completed' && (
                        <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                      {mbtiProgress?.progress?.status === 'in_progress' && (
                        <Badge className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
                          In Progress
                        </Badge>
                      )}
                      {(!mbtiProgress || mbtiProgress?.status === 'not_started') && (
                        <Badge variant="outline" className="border-gray-300 text-gray-600">
                          Not Started
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">MBTI Assessment</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Myers-Briggs Type Indicator - Personality assessment revealing cognitive preferences
                    </p>

                    {loadingMbti ? (
                      <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {/* Completed - Show result */}
                        {mbtiProgress?.progress?.status === 'completed' && mbtiProgress?.result && (
                          <>
                            <div className="bg-purple-50 rounded-lg p-3 mb-2">
                              <p className="text-sm text-gray-600 mb-1">Personality Type</p>
                              <p className="text-2xl font-bold text-purple-600">
                                {mbtiProgress.result.personalityType}
                              </p>
                            </div>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAssessment("mbti");
                              }}
                              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                            >
                              View Full Report
                            </Button>
                          </>
                        )}

                        {/* Not Started or In Progress */}
                        {(!mbtiProgress || mbtiProgress?.progress?.status !== 'completed') && (
                          <>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartMBTI();
                              }}
                              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                            >
                              {mbtiProgress?.progress?.status === 'in_progress' ? 'Continue Test' : 'Take Test'}
                            </Button>

                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyLink();
                              }}
                              variant="outline"
                              className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
                            >
                              {copySuccess ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Link Copied!
                                </>
                              ) : (
                                <>
                                  <Link2 className="w-4 h-4 mr-2" />
                                  Send Test Link
                                </>
                              )}
                            </Button>

                            {mbtiProgress?.testLink && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 break-all">
                                {mbtiProgress.testLink}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* RIASEC Card */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  onClick={() => riasecProgress?.result && setSelectedAssessment("riasec")}
                  className={`transition-all duration-300 border-2 bg-white/70 backdrop-blur-sm ${
                    selectedAssessment === "riasec"
                      ? "border-teal-500 shadow-xl shadow-teal-500/20"
                      : "border-gray-200/50 hover:border-teal-200 hover:shadow-lg"
                  } ${!riasecProgress?.result ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                        <Activity className="w-7 h-7 text-white" />
                      </div>
                      {riasecProgress?.progress?.status === 'completed' && (
                        <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                      {riasecProgress?.progress?.status === 'in_progress' && (
                        <Badge className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
                          In Progress
                        </Badge>
                      )}
                      {(!riasecProgress || riasecProgress?.status === 'not_started') && (
                        <Badge variant="outline" className="border-gray-300 text-gray-600">
                          Not Started
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">RIASEC Assessment</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Holland Code - Career interest assessment based on personality and work preferences
                    </p>

                    {loadingRiasec ? (
                      <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {/* Completed - Show result */}
                        {riasecProgress?.progress?.status === 'completed' && riasecProgress?.result && (
                          <>
                            <div className="bg-teal-50 rounded-lg p-3 mb-2">
                              <p className="text-sm text-gray-600 mb-1">Holland Code</p>
                              <p className="text-2xl font-bold text-teal-600">
                                {riasecProgress.result.topThree}
                              </p>
                            </div>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAssessment("riasec");
                              }}
                              className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
                            >
                              View Full Report
                            </Button>
                          </>
                        )}

                        {/* Not Started or In Progress */}
                        {(!riasecProgress || riasecProgress?.progress?.status !== 'completed') && (
                          <>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartRIASEC();
                              }}
                              className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
                            >
                              {riasecProgress?.progress?.status === 'in_progress' ? 'Continue Test' : 'Take Test'}
                            </Button>

                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyLinkRiasec();
                              }}
                              variant="outline"
                              className="w-full border-teal-200 text-teal-600 hover:bg-teal-50"
                            >
                              {copySuccessRiasec ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Link Copied!
                                </>
                              ) : (
                                <>
                                  <Link2 className="w-4 h-4 mr-2" />
                                  Send Test Link
                                </>
                              )}
                            </Button>

                            {riasecProgress?.testLink && (
                              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 break-all">
                                {riasecProgress.testLink}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Assessment Report */}
          <AnimatePresence mode="wait">
            {selectedAssessment === "mbti" && mbtiProgress?.result && (
              <motion.div
                key="mbti"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 shadow-xl">
                  <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                        <Brain className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">MBTI Report</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          Personality Type:{" "}
                          <span className="font-bold text-purple-600">
                            {mbtiProgress.result.personalityType}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Test completed: {new Date(mbtiProgress.result.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Dimension Scores */}
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Personality Dimensions
                      </h3>
                      {mbtiProgress.result.dimensions && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* E/I Dimension */}
                          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border border-blue-100">
                            <h4 className="font-semibold text-gray-800 mb-3">Extraversion / Introversion</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Extraversion (E)</span>
                                <span className="text-sm font-bold text-gray-900">{mbtiProgress.result.dimensions.EI?.E || 0}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${mbtiProgress.result.dimensions.EI?.E || 0}%` }}
                                />
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-gray-600">Introversion (I)</span>
                                <span className="text-sm font-bold text-gray-900">{mbtiProgress.result.dimensions.EI?.I || 0}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${mbtiProgress.result.dimensions.EI?.I || 0}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* S/N Dimension */}
                          <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-4 border border-green-100">
                            <h4 className="font-semibold text-gray-800 mb-3">Sensing / Intuition</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Sensing (S)</span>
                                <span className="text-sm font-bold text-gray-900">{mbtiProgress.result.dimensions.SN?.S || 0}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${mbtiProgress.result.dimensions.SN?.S || 0}%` }}
                                />
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-gray-600">Intuition (N)</span>
                                <span className="text-sm font-bold text-gray-900">{mbtiProgress.result.dimensions.SN?.N || 0}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${mbtiProgress.result.dimensions.SN?.N || 0}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* T/F Dimension */}
                          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-4 border border-purple-100">
                            <h4 className="font-semibold text-gray-800 mb-3">Thinking / Feeling</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Thinking (T)</span>
                                <span className="text-sm font-bold text-gray-900">{mbtiProgress.result.dimensions.TF?.T || 0}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${mbtiProgress.result.dimensions.TF?.T || 0}%` }}
                                />
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-gray-600">Feeling (F)</span>
                                <span className="text-sm font-bold text-gray-900">{mbtiProgress.result.dimensions.TF?.F || 0}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${mbtiProgress.result.dimensions.TF?.F || 0}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* J/P Dimension */}
                          <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-4 border border-orange-100">
                            <h4 className="font-semibold text-gray-800 mb-3">Judging / Perceiving</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Judging (J)</span>
                                <span className="text-sm font-bold text-gray-900">{mbtiProgress.result.dimensions.JP?.J || 0}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${mbtiProgress.result.dimensions.JP?.J || 0}%` }}
                                />
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-gray-600">Perceiving (P)</span>
                                <span className="text-sm font-bold text-gray-900">{mbtiProgress.result.dimensions.JP?.P || 0}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${mbtiProgress.result.dimensions.JP?.P || 0}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Test Summary */}
                    <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 border border-purple-100 shadow-sm">
                      <h4 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                        Test Summary
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <span className="text-gray-600">Personality Type:</span>
                          <span className="font-bold text-purple-600 text-lg">{mbtiProgress.result.personalityType}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <span className="text-gray-600">Test Completed:</span>
                          <span className="font-semibold text-gray-900">{new Date(mbtiProgress.result.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <span className="text-gray-600">Patient:</span>
                          <span className="font-semibold text-gray-900">{patient.fullName}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <span className="text-gray-600">Test ID:</span>
                          <span className="font-semibold text-gray-900">#{mbtiProgress.result.id}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {selectedAssessment === "riasec" && riasecProgress?.result && (
              <motion.div
                key="riasec"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50 shadow-xl">
                  <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-teal-50 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center shadow-lg">
                        <Activity className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">
                          RIASEC Report
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          Holland Code:{" "}
                          <span className="font-bold text-teal-600">
                            {riasecProgress.result.topThree}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Test completed: {new Date(riasecProgress.result.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* Interest Profile */}
                    <div className="mb-8 bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-6 border border-teal-100 shadow-sm">
                      <h4 className="font-semibold text-gray-900 text-lg mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-teal-600" />
                        Interest Profile
                      </h4>
                      {riasecProgress.result.scores && (
                        <div className="space-y-5">
                          {Object.entries(riasecProgress.result.scores)
                            .sort((a, b) => b[1] - a[1])
                            .map(([type, score], index) => {
                              const typeNames = {
                                R: 'Realistic',
                                I: 'Investigative',
                                A: 'Artistic',
                                S: 'Social',
                                E: 'Enterprising',
                                C: 'Conventional'
                              };
                              const colors = {
                                R: 'bg-red-500',
                                I: 'bg-green-500',
                                A: 'bg-purple-500',
                                S: 'bg-blue-500',
                                E: 'bg-orange-500',
                                C: 'bg-gray-500'
                              };
                              const percentage = Math.round((score / 10) * 100);
                              return (
                                <div key={type}>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-gray-700">
                                      {typeNames[type]} ({type})
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">
                                      {percentage}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-white rounded-full h-3 shadow-inner">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${percentage}%` }}
                                      transition={{ duration: 1, delay: index * 0.1 }}
                                      className={`${colors[type]} h-3 rounded-full shadow-lg`}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>

                    {/* Test Summary */}
                    <div className="bg-gradient-to-br from-teal-50 to-white rounded-2xl p-6 border border-teal-100 shadow-sm">
                      <h4 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-teal-600" />
                        Test Summary
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <span className="text-gray-600">Holland Code:</span>
                          <span className="font-bold text-teal-600 text-lg">{riasecProgress.result.topThree}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <span className="text-gray-600">Full Code:</span>
                          <span className="font-semibold text-gray-900">{riasecProgress.result.riasecCode}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <span className="text-gray-600">Test Completed:</span>
                          <span className="font-semibold text-gray-900">{new Date(riasecProgress.result.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <span className="text-gray-600">Patient:</span>
                          <span className="font-semibold text-gray-900">{patient.fullName}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <span className="text-gray-600">Test ID:</span>
                          <span className="font-semibold text-gray-900">#{riasecProgress.result.id}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <span className="text-gray-600">Questions:</span>
                          <span className="font-semibold text-gray-900">30</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
